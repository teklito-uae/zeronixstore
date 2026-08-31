<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // No wildcard here: `supports_credentials` is true below, and browsers reject
    // "*" combined with credentialed requests outright. Set ALLOWED_ORIGINS in .env
    // to a comma-separated list of exact origins (scheme + host + port), e.g.
    // ALLOWED_ORIGINS=https://zeronix.ae,https://www.zeronix.ae
    'allowed_origins' => explode(',', env('ALLOWED_ORIGINS', 'http://localhost:5173')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
