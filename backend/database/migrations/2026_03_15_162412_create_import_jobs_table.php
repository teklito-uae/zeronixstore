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
        Schema::create('import_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('source_category_url');
            $table->foreignId('local_category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->enum('status', ['pending', 'crawling_links', 'scraping_products', 'downloading_images', 'completed', 'failed'])->default('pending');
            $table->integer('total_found')->default(0);
            $table->integer('processed_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->json('error_logs')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('import_jobs');
    }
};
