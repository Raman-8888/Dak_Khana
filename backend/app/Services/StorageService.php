<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StorageService
{
    /**
     * Store a file locally or in Supabase Storage when configured.
     *
     * @return string Relative path (local) or public HTTPS URL (Supabase public bucket)
     */
    public function upload(string $path, UploadedFile|string $file): string
    {
        $normalized = $this->normalizeObjectPath($path);

        if ($this->supabaseUploadConfigured()) {
            $body = $file instanceof UploadedFile
                ? $file->getContent()
                : (is_string($file) ? $file : '');

            $mime = $file instanceof UploadedFile
                ? ($file->getClientMimeType() ?: 'application/octet-stream')
                : 'application/octet-stream';

            $url = $this->uploadToSupabase($normalized, $body, $mime);
            if ($url !== null) {
                return $url;
            }
        }

        if ($file instanceof UploadedFile) {
            return $file->storeAs(dirname($normalized), basename($normalized), 'local');
        }

        Storage::disk('local')->put($normalized, $file);

        return $normalized;
    }

    /**
     * Resolves a stored path to a URL or absolute local path for downloads.
     */
    public function publicUrl(string $path): string
    {
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return Storage::disk('local')->path($path);
    }

    public function supabaseUploadConfigured(): bool
    {
        $base = config('services.supabase.url');
        $key = config('services.supabase.service_role_key');

        return $base !== '' && $base !== null && $key !== '' && $key !== null;
    }

    protected function normalizeObjectPath(string $path): string
    {
        return ltrim(str_replace('\\', '/', $path), '/');
    }

    protected function uploadToSupabase(string $objectPath, string $contents, string $mime): ?string
    {
        $base = config('services.supabase.url');
        $key = config('services.supabase.service_role_key');
        $bucket = config('services.supabase.storage_bucket', 'exports');

        $endpoint = $base.'/storage/v1/object/'.$bucket.'/'.$objectPath;

        $response = Http::timeout(120)
            ->withHeaders([
                'Authorization'  => 'Bearer '.$key,
                'apikey'           => $key,
                'Content-Type'     => $mime,
                'x-upsert'         => 'true',
            ])
            ->withBody($contents, $mime)
            ->post($endpoint);

        if (! $response->successful()) {
            report(new \RuntimeException('Supabase storage upload failed: '.$response->body()));

            return null;
        }

        // Public bucket URL (create bucket as public in Supabase, or switch to signed URLs later).
        return $base.'/storage/v1/object/public/'.$bucket.'/'.$objectPath;
    }
}
