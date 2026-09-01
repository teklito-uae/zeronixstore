<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Microless's own numeric category id (e.g. 1603 for "All-in-One
            // Computers"). Set this on a category to let the scheduled
            // refresh command know to keep pulling new products for it.
            $table->string('microless_category_id')->nullable()->after('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('microless_category_id');
        });
    }
};
