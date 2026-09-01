<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 2;
        while (
            BlogPost::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }

    // Public routes
    public function index(Request $request)
    {
        $perPage = min((int) $request->query('per_page', 12), 50);

        $posts = BlogPost::published()
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($posts)->header('Cache-Control', 'public, max-age=60');
    }

    public function show(string $slug)
    {
        $post = BlogPost::published()->where('slug', $slug)->firstOrFail();
        return response()->json($post)->header('Cache-Control', 'public, max-age=60');
    }

    // Admin routes
    public function adminIndex(Request $request)
    {
        $query = BlogPost::query();
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'cover_image' => 'nullable|image|max:4096',
            'author_name' => 'nullable|string|max:255',
            'status' => 'in:draft,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title']);

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('blog', 'public');
        }

        if (($validated['status'] ?? 'draft') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);
        return response()->json($post, 201);
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'sometimes|required|string',
            'cover_image' => 'nullable|image|max:4096',
            'author_name' => 'nullable|string|max:255',
            'status' => 'in:draft,published',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = $this->uniqueSlug($validated['title'], $blogPost->id);
        }

        if ($request->hasFile('cover_image')) {
            if ($blogPost->cover_image && !str_starts_with($blogPost->cover_image, 'http')) {
                Storage::disk('public')->delete($blogPost->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('blog', 'public');
        }

        if (
            ($validated['status'] ?? $blogPost->status) === 'published'
            && empty($validated['published_at'] ?? $blogPost->published_at)
        ) {
            $validated['published_at'] = now();
        }

        $blogPost->update($validated);
        return response()->json($blogPost);
    }

    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->cover_image && !str_starts_with($blogPost->cover_image, 'http')) {
            Storage::disk('public')->delete($blogPost->cover_image);
        }
        $blogPost->delete();
        return response()->json(null, 204);
    }
}
