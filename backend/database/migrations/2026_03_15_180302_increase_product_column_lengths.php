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
        Schema::table('products', function (Blueprint $table) {
            // Drop unique first if it exists
            $table->dropUnique(['source_url']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->text('name')->change();
            $table->text('source_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('name', 255)->change();
            $table->string('source_url', 255)->nullable()->unique()->change();
        });
    }
};
