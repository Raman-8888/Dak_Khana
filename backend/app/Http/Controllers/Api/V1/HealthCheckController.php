<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\MongoService;
use App\Services\StorageService;
use Illuminate\Support\Facades\DB;

class HealthCheckController extends Controller
{
    public function index(MongoService $mongo, StorageService $storage)
    {
        $payload = [
            'status'    => 'ok',
            'app'       => config('app.name'),
            'database'  => $this->safeDbPing(),
            'mongodb'   => [
                'configured' => $mongo->isConfigured(),
                'extension'  => $mongo->isExtensionLoaded(),
                'library'    => $mongo->libraryAvailable(),
                'reachable'  => $mongo->isConfigured() && $mongo->isExtensionLoaded() && $mongo->libraryAvailable()
                    ? $mongo->ping()
                    : null,
            ],
            'supabase'  => [
                'storage_ready' => $storage->supabaseUploadConfigured(),
                'sql_fallback'  => (bool) config('database.connections.supabase.url')
                    || (bool) env('SUPABASE_DATABASE_URL'),
            ],
        ];

        return response()->json($payload);
    }

    protected function safeDbPing(): string
    {
        try {
            DB::connection()->getPdo();

            return 'ok';
        } catch (\Throwable $e) {
            return 'error';
        }
    }
}
