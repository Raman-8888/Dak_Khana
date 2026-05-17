<?php

namespace App\Services;

use App\Models\ExportRequest;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    /**
     * Create a minimal placeholder file for an export pack slip (PDF pipeline can replace this later).
     */
    public function generateExportDocument(ExportRequest $request): string
    {
        $relative = 'documents/export-'.$request->id.'.txt';
        $body = "DakExport shipment {$request->tracking_number}\nStatus: {$request->status}\n";

        Storage::disk('local')->put($relative, $body);

        return $relative;
    }
}
