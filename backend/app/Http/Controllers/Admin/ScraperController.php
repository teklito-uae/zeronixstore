<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ImportJob;
use App\Jobs\CrawlCategoryPageJob;
use App\Jobs\MicrolessApiImportJob;
use App\Jobs\ProcessMicrolessProductJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScraperController extends Controller
{
    public function startImport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_category_url' => 'required|url',
            'local_category_id' => 'required|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $importJob = ImportJob::create([
            'admin_id' => $request->user()->id,
            'source_category_url' => $request->source_category_url,
            'local_category_id' => $request->local_category_id,
            'status' => 'pending',
        ]);

        CrawlCategoryPageJob::dispatch($importJob);

        return response()->json([
            'message' => 'Import job started successfully',
            'job' => $importJob
        ], 201);
    }

    public function getStatus($id)
    {
        $job = ImportJob::with(['logs' => function($query) {
            $query->orderBy('created_at', 'desc')->take(20);
        }])->findOrFail($id);
        
        // Calculate percentage
        $percentage = 0;
        if ($job->total_found > 0) {
            $percentage = round(($job->processed_count / $job->total_found) * 100);
        }

        return response()->json([
            'job' => $job,
            'percentage' => $percentage,
            'logs' => $job->logs
        ]);
    }

    public function rerunFailed($id)
    {
        $job = ImportJob::findOrFail($id);
        $failedLogs = $job->logs()->where('status', 'failed')->get();

        if ($failedLogs->isEmpty()) {
            return response()->json(['message' => 'No failed products to re-run'], 200);
        }

        // Reset counts for the job to allow re-processing
        $job->update([
            'status' => 'scraping_products',
            'failed_count' => $job->failed_count - $failedLogs->count()
        ]);

        foreach ($failedLogs as $log) {
            $productData = $log->data['input_data'] ?? null;
            if ($productData) {
                // Delete the failed log entry so it can be re-created during processing
                $log->delete();
                ProcessMicrolessProductJob::dispatch($job, $productData);
            }
        }

        return response()->json(['message' => 'Re-run started for ' . $failedLogs->count() . ' failed products']);
    }

    public function getRecentImports()
    {
        $jobs = ImportJob::with('localCategory:id,name')->orderBy('created_at', 'desc')->take(10)->get();
        return response()->json($jobs);
    }

    public function startMicrolessImport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'local_category_id' => 'required|exists:categories,id',
            'category_id' => 'nullable|string',
            'brands' => 'nullable|string',
            'query' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $importJob = ImportJob::create([
            'admin_id' => $request->user()->id,
            'source_category_url' => 'Microless API: ' . ($request->input('query') ?? 'Category ' . $request->input('category_id')),
            'local_category_id' => $request->local_category_id,
            'status' => 'pending',
        ]);

        MicrolessApiImportJob::dispatch($importJob, $request->only(['category_id', 'brands', 'query', 'filters', 'sort']));

        return response()->json([
            'message' => 'Microless API import job started successfully',
            'job' => $importJob
        ], 201);
    }

    public function stopImport($id)
    {
        $job = ImportJob::findOrFail($id);
        
        if (!in_array($job->status, ['completed', 'failed'])) {
            $job->update([
                'status' => 'failed',
                'error_logs' => json_encode(['error' => 'Manually stopped by administrator'])
            ]);
        }

        return response()->json(['message' => 'Job stopping initiated', 'job' => $job]);
    }

    public function importFromJson(Request $request)
    {
        $request->validate([
            'local_category_id' => 'required|exists:categories,id',
            'products' => 'required|array|min:1',
        ]);

        $importJob = ImportJob::create([
            'admin_id' => $request->user()->id,
            'source_category_url' => 'Microless JSON Import (' . count($request->products) . ' products)',
            'local_category_id' => $request->local_category_id,
            'status' => 'scraping_products',
            'total_found' => count($request->products),
        ]);

        // Extract and bulk-create brands from category_brands_str if present
        if ($request->has('category_brands_str') && !empty($request->category_brands_str)) {
            $brandNames = array_map('trim', explode(',', $request->category_brands_str));
            foreach ($brandNames as $brandName) {
                \App\Models\Brand::findOrCreateByName($brandName);
            }
        }

        foreach ($request->products as $productData) {
            ProcessMicrolessProductJob::dispatch($importJob, $productData);
        }

        return response()->json([
            'message' => 'Import started successfully.',
            'job' => $importJob
        ]);
    }
}
