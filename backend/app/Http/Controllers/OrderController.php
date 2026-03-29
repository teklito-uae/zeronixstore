<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Events\OrderPlaced;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->orders()->with('items.product')->get());
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()->orders()->with('items.product', 'items.variant')->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string'
        ]);

        return $this->createOrder($validated, $request->user());
    }

    public function guestStore(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|array',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
            'email' => 'required|email',
            'phone' => 'required|string'
        ]);

        return $this->createOrder($validated, null);
    }

    private function createOrder($validated, $user = null)
    {
        DB::beginTransaction();
        try {
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                // Handle variant price if variant_id exists, assuming product price for MVP
                $price = $product->sale_price ?? $product->price;
                $lineTotal = $price * $item['quantity'];
                
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'variant_id' => $item['variant_id'] ?? null,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'total' => $lineTotal,
                ];
            }

            $tax = $subtotal * 0.05; // Example 5% tax
            $shippingCost = ($validated['shipping_method'] ?? 'standard') === 'express' ? 25 : 0;
            $total = $subtotal + $tax + $shippingCost;

            $email = $user ? $user->email : ($validated['email'] ?? null);
            $phone = $validated['phone'] ?? ($validated['shipping_address']['phone'] ?? null);

            $order = Order::create([
                'user_id' => $user ? $user->id : null,
                'email' => $email,
                'phone' => $phone,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'shipping_address' => $validated['shipping_address'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
                'notes' => $validated['notes'] ?? null,
            ]);

            // Save address to user_addresses if it's new
            if ($user && isset($validated['shipping_address']['save_address']) && $validated['shipping_address']['save_address'] !== false) {
                $addrData = $validated['shipping_address'];
                $existing = $user->addresses()
                    ->where('address_line1', $addrData['address'] ?? $addrData['address_line1'] ?? '')
                    ->where('city', $addrData['city'] ?? '')
                    ->first();
                
                if (!$existing) {
                    $user->addresses()->create([
                        'first_name' => $addrData['firstName'] ?? $addrData['first_name'] ?? $user->name,
                        'last_name' => $addrData['lastName'] ?? $addrData['last_name'] ?? '',
                        'address_line1' => $addrData['address'] ?? $addrData['address_line1'] ?? '',
                        'city' => $addrData['city'] ?? '',
                        'state' => $addrData['state'] ?? 'Dubai',
                        'postal_code' => $addrData['postalCode'] ?? $addrData['postal_code'] ?? '00000',
                        'type' => $addrData['type'] ?? 'home',
                        'is_default' => $user->addresses()->count() === 0
                    ]);
                }
            }

            foreach ($itemsData as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            DB::commit();

            // Fire event
            event(new OrderPlaced($order));

            return response()->json($order->load('items.product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin Methods
    public function adminIndex()
    {
        return response()->json(Order::with('user', 'items.product')->latest()->paginate(20));
    }

    public function adminUpdate(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded',
        ]);

        $order->update($validated);
        return response()->json($order);
    }
}
