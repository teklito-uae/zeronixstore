<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Keeps mapped categories topped up with new Microless listings. Requires a
// real system cron calling `php artisan schedule:run` every minute (see
// deployment notes) — this entry just declares what should run and when.
Schedule::command('imports:refresh-microless')
    ->dailyAt('03:00')
    ->withoutOverlapping();
