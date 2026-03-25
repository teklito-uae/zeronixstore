<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\Admin\ScraperController;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/search', [ProductController::class, 'search']);
Route::get('/products/brands', [ProductController::class, 'brandsForCategory']);
Route::get('/products/price-range', [ProductController::class, 'getPriceRange']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // User Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Address routes
    Route::get('/addresses', [AddressController::class, 'index']);
    Route::post('/addresses', [AddressController::class, 'store']);
    Route::put('/addresses/{address}', [AddressController::class, 'update']);
    Route::delete('/addresses/{address}', [AddressController::class, 'destroy']);
    Route::post('/addresses/{address}/default', [AddressController::class, 'makeDefault']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function() {
        Route::get('/products', [ProductController::class, 'adminIndex']);
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        
        Route::get('/orders', [OrderController::class, 'adminIndex']);
        Route::put('/orders/{order}', [OrderController::class, 'adminUpdate']);

        // Scraper / Imports
        Route::get('/imports', [ScraperController::class, 'getRecentImports']);
        Route::post('/imports/start', [ScraperController::class, 'startImport']);
        Route::post('/imports/microless/start', [ScraperController::class, 'startMicrolessImport']);
        Route::post('/imports/json', [ScraperController::class, 'importFromJson']);
        Route::get('/imports/{id}/status', [ScraperController::class, 'getStatus']);
        Route::post('/imports/{id}/stop', [ScraperController::class, 'stopImport']);
        Route::post('/imports/{id}/rerun-failed', [ScraperController::class, 'rerunFailed']);
    });
});
