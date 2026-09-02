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
        Schema::dropIfExists('import_logs');
        Schema::dropIfExists('import_jobs');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['source_url', 'is_imported', 'import_metadata']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('microless_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('microless_category_id')->nullable();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('source_url')->nullable()->unique();
            $table->boolean('is_imported')->default(false);
            $table->json('import_metadata')->nullable();
        });

        Schema::create('import_jobs', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });

        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
