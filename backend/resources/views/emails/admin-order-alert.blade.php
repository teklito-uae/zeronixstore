<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; padding: 20px; }
        .box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; max-width: 600px; }
    </style>
</head>
<body>
    <div class="box">
        <h2>New Order Alert 🛒</h2>
        <p><strong>Order #:</strong> {{ $order->order_number }}</p>
        <p><strong>Total:</strong> AED {{ number_format($order->total, 2) }}</p>
        <p><strong>Customer:</strong> {{ $order->email }} ({{ $order->phone }})</p>
        <p><strong>Payment Method:</strong> {{ $order->payment_method }}</p>
        
        <hr>
        
        <h4>Items:</h4>
        <ul>
            @foreach($order->items as $item)
                <li>{{ $item->quantity }}x {{ $item->product->name }}</li>
            @endforeach
        </ul>
        
        <a href="{{ config('app.url') }}/admin/orders">View in Admin Panel</a>
    </div>
</body>
</html>
