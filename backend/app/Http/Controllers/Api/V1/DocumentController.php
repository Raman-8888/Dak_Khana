<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $documents = Document::query()
            ->whereHas('exportRequest', function ($q) use ($request) {
                $q->where('customer_id', $request->user()->id);
            })
            ->with('exportRequest:id,tracking_number,status')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $documents,
        ]);
    }

    public function download(Request $request, int $id): StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $document = Document::query()
            ->whereHas('exportRequest', function ($q) use ($request) {
                $q->where('customer_id', $request->user()->id);
            })
            ->findOrFail($id);

        if (Str::startsWith($document->file_path, ['http://', 'https://'])) {
            return redirect()->away($document->file_path);
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'File not found.',
            ], 404);
        }

        return Storage::disk('local')->download($document->file_path);
    }
}
