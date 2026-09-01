<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// SEO metadata fields. Deliberately NOT adding a `meta_keywords` column —
// the <meta name="keywords"> tag has been ignored by search engines since
// ~2009 and would just be dead weight. `search_keywords` is different: it's
// free-text fed into ProductController::index()'s `search` LIKE filter (and
// an equivalent lookup for categories), so a shopper's own phrasing (e.g.
// "gaming laptop dubai", "rtx 4070 laptop") can match a listing even when
// that exact phrase never appears in its name/description.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('meta_title', 70)->nullable()->after('description');
            $table->string('meta_description', 170)->nullable()->after('meta_title');
            $table->text('search_keywords')->nullable()->after('meta_description');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->string('meta_title', 70)->nullable()->after('description');
            $table->string('meta_description', 170)->nullable()->after('meta_title');
            $table->text('search_keywords')->nullable()->after('meta_description');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description', 'search_keywords']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['meta_title', 'meta_description', 'search_keywords']);
        });
    }
};
