<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;

class VariantController extends Controller
{
    private function rules($variant = null): array
    {
        $skuRule = 'required|string|unique:variants,sku';
        if ($variant) {
            $skuRule .= ',' . $variant->id;
        }

        return [
            'sku' => $skuRule,
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'stock' => 'required|integer|min:0',
            'attributes' => 'nullable|array',
            'attributes.*' => 'nullable|string',
        ];
    }

    public function store(Request $request, Product $product)
    {
        $validated = $request->validate($this->rules());

        $variant = $product->variants()->create($validated);

        return response()->json($variant, 201);
    }

    public function update(Request $request, Product $product, Variant $variant)
    {
        $validated = $request->validate($this->rules($variant));

        $variant->update($validated);

        return response()->json($variant);
    }

    public function destroy(Product $product, Variant $variant)
    {
        $variant->delete();

        return response()->json(null, 204);
    }
}
