<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderConfirmationMail;
use App\Mail\AdminOrderAlertMail;
use Illuminate\Support\Facades\Mail;

class SendOrderNotifications
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;

        // Send confirmation to customer
        if ($order->email) {
            Mail::to($order->email)->queue(new OrderConfirmationMail($order));
        }

        // Send alert to admin
        $adminEmail = config('mail.admin_address', 'admin@zeronix.store');
        if ($adminEmail) {
            Mail::to($adminEmail)->queue(new AdminOrderAlertMail($order));
        }
    }
}
