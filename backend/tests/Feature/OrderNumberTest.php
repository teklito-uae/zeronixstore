<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderNumberTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_order_gets_a_unique_order_number(): void
    {
        $orders = collect(range(1, 5))->map(fn () => $this->makeOrder());

        $orderNumbers = $orders->pluck('order_number');

        $this->assertCount(5, $orderNumbers->unique());
        $orderNumbers->each(fn ($number) => $this->assertMatchesRegularExpression('/^ZNX-\d{4,}$/', $number));
    }

    public function test_order_number_is_derived_from_the_auto_increment_id_not_a_precomputed_max(): void
    {
        $order = $this->makeOrder();

        $this->assertSame('ZNX-' . str_pad((string) $order->id, 4, '0', STR_PAD_LEFT), $order->order_number);
    }

    private function makeOrder(): Order
    {
        return Order::create([
            'email' => 'guest@example.com',
            'subtotal' => 100,
            'tax' => 0,
            'total' => 100,
            'shipping_address' => ['line1' => 'Test St'],
            'payment_method' => 'cod',
        ]);
    }
}
