<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Raw SQL (not Schema::table()->change()) so this doesn't require
        // doctrine/dbal, which isn't installed in this project.
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite has no fixed varchar length to alter — the column
            // already accepts arbitrarily long strings.
            return;
        }

        // path: scraped product titles run well past 150 chars, and the
        // generated filename adds a "/storage/products/..._zeronix_{id}_{n}.ext"
        // wrapper on top.
        DB::statement('ALTER TABLE product_images MODIFY path VARCHAR(500) NOT NULL');

        // alt: defaults to the full product title. Laravel's MySQL string
        // columns are capped at 191 chars app-wide (see AppServiceProvider's
        // Schema::defaultStringLength(191), the standard workaround for
        // older MySQL/MariaDB's 767-byte index prefix limit) — plenty for
        // most columns, too tight for a full scraped title.
        DB::statement('ALTER TABLE product_images MODIFY alt VARCHAR(500) NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE product_images MODIFY path VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE product_images MODIFY alt VARCHAR(191) NULL');
    }
};
