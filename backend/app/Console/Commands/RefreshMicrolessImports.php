<?php

namespace App\Console\Commands;

use App\Jobs\MicrolessApiImportJob;
use App\Models\Category;
use App\Models\ImportJob;
use App\Models\User;
use Illuminate\Console\Command;

class RefreshMicrolessImports extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'imports:refresh-microless';

    /**
     * The console command description.
     */
    protected $description = 'Re-run a Microless API import for every category that has a microless_category_id mapped, picking up new products since the last run.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $categories = Category::whereNotNull('microless_category_id')->get();

        if ($categories->isEmpty()) {
            $this->info('No categories have a Microless category id mapped — nothing to refresh. Set one via Admin > Categories.');
            return self::SUCCESS;
        }

        // Attributed to a real admin since import_jobs.admin_id is not
        // nullable — this is a system-triggered run, not any one admin's
        // manual action, so the first admin account stands in for it.
        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            $this->error('No admin user exists to attribute scheduled imports to.');
            return self::FAILURE;
        }

        foreach ($categories as $category) {
            $importJob = ImportJob::create([
                'admin_id' => $admin->id,
                'source_category_url' => "Scheduled Microless Refresh: {$category->name}",
                'local_category_id' => $category->id,
                'status' => 'pending',
            ]);

            MicrolessApiImportJob::dispatch($importJob, [
                'category_id' => $category->microless_category_id,
            ]);

            $this->info("Queued refresh for \"{$category->name}\" (import job #{$importJob->id}).");
        }

        return self::SUCCESS;
    }
}
