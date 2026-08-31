<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status', 'subtotal', 'tax', 'total',
        'shipping_address', 'payment_method', 'payment_status', 'notes',
        'email', 'phone'
    ];

    protected static function booted()
    {
        // Generated post-insert from the DB's own auto-increment id, which the
        // database guarantees is unique even under concurrent order creation.
        // (Previously this pre-computed `latest('id') + 1` before insert, which
        // two concurrent requests could both read before either committed,
        // producing a duplicate order_number / unique-constraint failure.)
        static::created(function ($order) {
            if (!$order->order_number) {
                $order->order_number = 'ZNX-' . str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
                $order->saveQuietly();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
