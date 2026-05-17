<?php

namespace App\Http\Controllers\Api\V1\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\ExportRequest;
use Illuminate\Http\Request;

class ScanController extends Controller
{
    /**
     * Record a warehouse scan event on a shipment (receiving, sorting, dispatch).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tracking_number' => 'required|string|max:40',
            'action'          => 'required|string|max:64',
            'notes'           => 'nullable|string|max:500',
        ]);

        $export = ExportRequest::query()
            ->where('tracking_number', $validated['tracking_number'])
            ->firstOrFail();

        $export->trackingEvents()->create([
            'status'   => $validated['action'],
            'location' => 'Warehouse',
            'notes'    => $validated['notes'] ?? 'Scan: '.$validated['action'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Scan recorded.',
            'data'    => $export->fresh()->load(['trackingEvents', 'receiverDetail']),
        ], 201);
    }
}
