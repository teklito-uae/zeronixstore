<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #10b981; text-decoration: none; }
        .order-box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        .item { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 5px; }
        .total-final { font-size: 18px; font-weight: bold; color: #10b981; }
        .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="{{ config('app.url') }}" class="logo">ZERONIX</a>
            <h2>Order Confirmed!</h2>
            <p>Thank you for shopping with us. Your order #{{ $order->order_number }} has been received.</p>
        </div>

        <div class="order-box">
            <h3 style="margin-top: 0">Order Details</h3>
            
            @foreach($order->items as $item)
                <div class="item">
                    <div>
                        <strong>{{ $item->product->name }}</strong><br>
                        <small>Qty: {{ $item->quantity }}</small>
                    </div>
                    <div>AED {{ number_format($item->total, 2) }}</div>
                </div>
            @endforeach

            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>AED {{ number_format($order->subtotal, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>VAT (5%):</span>
                    <span>AED {{ number_format($order->tax, 2) }}</span>
                </div>
                <div class="total-row">
                    <span>Shipping:</span>
                    <span>{{ ($order->total - $order->subtotal - $order->tax) > 0 ? 'AED '.number_format($order->total - $order->subtotal - $order->tax, 2) : 'Free' }}</span>
                </div>
                <div class="total-row" style="margin-top: 10px;">
                    <strong>Total:</strong>
                    <strong class="total-final">AED {{ number_format($order->total, 2) }}</strong>
                </div>
            </div>
        </div>

        <div class="order-box">
            <h3 style="margin-top: 0">Shipping Address</h3>
            @php $addr = $order->shipping_address; @endphp
            <p style="margin: 0;">
                {{ $addr['firstName'] ?? $addr['first_name'] ?? '' }} {{ $addr['lastName'] ?? $addr['last_name'] ?? '' }}<br>
                {{ $addr['address'] ?? $addr['address_line1'] ?? '' }}<br>
                {{ $addr['city'] ?? '' }}, {{ $addr['state'] ?? '' }}<br>
                Phone: {{ $order->phone ?? ($addr['phone'] ?? '') }}
            </p>
            
            <h4 style="margin-bottom: 5px;">Delivery Estimate</h4>
            <p style="margin: 0; color: #10b981;">
                1–2 business days (Standard)
            </p>
        </div>

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/profile" class="btn">Track Your Order</a>
        </div>

        <div class="footer">
            <p>If you have any questions, reply to this email or contact support via WhatsApp.</p>
            <p>&copy; {{ date('Y') }} Zeronix UAE. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
