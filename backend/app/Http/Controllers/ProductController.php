<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    private function getAllDescendantIds($categoryId)
    {
        $ids = [];
        $children = \App\Models\Category::where('parent_id', $categoryId)->pluck('id')->toArray();
        foreach ($children as $childId) {
            $ids[] = $childId;
            $ids = array_merge($ids, $this->getAllDescendantIds($childId));
        }
        return $ids;
    }

    public function index(Request $request)
    {
        $perPage = min((int) $request->query('per_page', 24), 100);
        $version = Cache::get('products_cache_version', 0);
        
        $cacheKey = 'products_page_' . md5(json_encode($request->all())) . '_v' . $version;

        $products = Cache::remember($cacheKey, 60, function () use ($request, $perPage) {
            $query = Product::with(['category', 'variants', 'brand']);

            if ($request->has('category')) {
                $category = Category::where('slug', $request->category)->first();
                if ($category) {
                    $allIds = array_merge([$category->id], $this->getAllDescendantIds($category->id));
                    $query->whereIn('category_id', $allIds);
                } else {
                    $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
                }
            }

            if ($request->has('brand')) {
                $brandSlugs = explode(',', $request->brand);
                $query->whereHas('brand', function($q) use ($brandSlugs) {
                    $q->whereIn('slug', $brandSlugs);
                });
            }
            
            if ($request->has('price_min')) {
                $query->where('price', '>=', $request->price_min);
            }

            if ($request->has('price_max')) {
                $query->where('price', '<=', $request->price_max);
            }
            
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            return $query->paginate($perPage);
        });

        return response()->json($products)->header('Cache-Control', 'public, max-age=60');
    }

    /**
     * Get brands available in a given category (and descendants).
     */
    public function brandsForCategory(Request $request)
    {
        $categorySlug = $request->query('category', 'all');
        $version = Cache::get('products_cache_version', 0);
        $cacheKey = 'brands_for_' . $categorySlug . '_v' . $version;
        
        $brands = Cache::remember($cacheKey, 300, function () use ($request, $categorySlug) {
            if ($categorySlug === 'all') {
                return Brand::orderBy('name')->get();
            }

            $category = Category::where('slug', $categorySlug)->first();
            if (!$category) return collect([]);

            $allCategoryIds = array_merge([$category->id], $this->getAllDescendantIds($category->id));

            // Refined: Strictly get brands that have at least one product in these specific categories
            return Brand::whereHas('products', function ($q) use ($allCategoryIds) {
                $q->whereIn('category_id', $allCategoryIds);
            })
            ->select('id', 'name', 'slug')
            ->orderBy('name')
            ->get();
        });

        return response()->json($brands)->header('Cache-Control', 'public, max-age=300');
    }

    /**
     * Get min/max prices available in a given category (and descendants).
     */
    public function getPriceRange(Request $request)
    {
        $categorySlug = $request->query('category');
        $query = Product::query();

        if ($categorySlug) {
            $category = Category::where('slug', $categorySlug)->first();
            if ($category) {
                $allCategoryIds = array_merge([$category->id], $this->getAllDescendantIds($category->id));
                $query->whereIn('category_id', $allCategoryIds);
            }
        }

        $min = (float) $query->min('price') ?: 0;
        $max = (float) $query->max('price') ?: 10000;

        return response()->json([
            'min' => $min,
            'max' => $max,
        ]);
    }

    /**
     * Lightweight autocomplete search endpoint.
     * GET /api/products/search?q=term&limit=8
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));
        $limit = min((int) $request->query('limit', 8), 20);

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $products = Product::with(['category:id,name,slug', 'brand:id,name', 'imagesGallery'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhereHas('brand', fn($bq) => $bq->where('name', 'like', "%{$q}%"));
            })
            ->where('status', 'active')
            ->limit($limit)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'sale_price' => $product->sale_price,
                    'primary_image_url' => $product->primary_image_url,
                    'category' => $product->category ? [
                        'name' => $product->category->name,
                        'slug' => $product->category->slug,
                    ] : null,
                    'brand' => ($product->brand_id && is_object($product->getRelation('brand'))) ? [
                        'name' => $product->getRelation('brand')->name,
                    ] : null,
                ];
            });

        return response()->json($products);
    }

    public function show($slug)
    {
        $cacheKey = 'pr_d_' . md5($slug);
        $product = Cache::remember($cacheKey, 300, function () use ($slug) {
            return Product::with(['category', 'variants', 'imagesGallery', 'brand'])->where('slug', $slug)->firstOrFail();
        });

        return response()->json($product)->header('Cache-Control', 'public, max-age=300');
    }

    // Admin methods
    public function adminIndex(Request $request)
    {
        $query = Product::with('category');
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhereHas('brand', fn($bq) => $bq->where('name', 'like', "%{$searchTerm}%"));
            });
        }
        return response()->json($query->latest()->paginate(20));
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'description' => 'nullable|string',
            'brand' => 'nullable|string',
            'sale_price' => 'nullable|numeric',
            'cpu' => 'nullable|string',
            'gpu' => 'nullable|string',
            'ram' => 'nullable|string',
            'storage' => 'nullable|string',
            'featured' => 'boolean',
            'status' => 'in:active,draft',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50'
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'price' => 'sometimes|required|numeric',
            'description' => 'nullable|string',
            'brand' => 'nullable|string',
            'sale_price' => 'nullable|numeric',
            'cpu' => 'nullable|string',
            'gpu' => 'nullable|string',
            'ram' => 'nullable|string',
            'storage' => 'nullable|string',
            'featured' => 'boolean',
            'status' => 'in:active,draft',
            'badge' => 'nullable|string|max:50',
            'badge_color' => 'nullable|string|max:50'
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
