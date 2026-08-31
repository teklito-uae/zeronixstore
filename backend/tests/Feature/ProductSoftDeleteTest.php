<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSoftDeleteTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_a_product_does_not_destroy_its_order_line_items(): void
    {
        $category = Category::create(['name' => 'Cooling', 'slug' => 'cooling']);
        $product = Product::create([
            'name' => 'Test Cooler',
            'slug' => 'test-cooler',
            'category_id' => $category->id,
            'price' => 199.99,
        ]);

        $order = Order::create([
            'email' => 'guest@example.com',
            'subtotal' => 199.99,
            'tax' => 0,
            'total' => 199.99,
            'shipping_address' => ['line1' => 'Test St'],
            'payment_method' => 'cod',
        ]);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 199.99,
            'total' => 199.99,
        ]);

        $product->delete();

        $this->assertSoftDeleted($product);
        $this->assertDatabaseHas('order_items', ['id' => $item->id, 'product_id' => $product->id]);
        $this->assertNotNull(OrderItem::find($item->id));
    }
}
