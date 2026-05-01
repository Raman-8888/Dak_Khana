<?php

namespace App\Services;

class StorageService
{
    /**
     * Upload a file to S3/Supabase storage.
     * 
     * @param string $path
     * @param mixed $file
     * @return string Public URL
     */
    public function upload($path, $file)
    {
        // Placeholder for Supabase S3 wrapper logic
        return "https://supabase-storage.url/{$path}";
    }
}
