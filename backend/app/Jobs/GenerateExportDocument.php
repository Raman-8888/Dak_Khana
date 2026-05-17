<?php

namespace App\Jobs;

use App\Models\ExportRequest;
use App\Services\DocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateExportDocument implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public ExportRequest $exportRequest) {}

    public function handle(DocumentService $documents): void
    {
        $documents->generateExportDocument($this->exportRequest);
    }
}
