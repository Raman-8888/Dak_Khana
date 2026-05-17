<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\ExportRequest;

class ShipmentTrackingController extends Controller
{
    public function show($tracking_number)
    {
        $exportRequest = ExportRequest::where('tracking_number', $tracking_number)
            ->with([
                'shipmentLogs'    => fn ($q) => $q->latest(),
                'trackingEvents'  => fn ($q) => $q->latest(),
                'receiverDetail',
                'packageDetail',
            ])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $exportRequest
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'location' => 'required|string',
            'message' => 'nullable|string',
        ]);

        $exportRequest = ExportRequest::findOrFail($id);
        $exportRequest->update(['status' => $validated['status']]);

        $log = $exportRequest->shipmentLogs()->create([
            'status' => $validated['status'],
            'location' => $validated['location'],
            'message' => $validated['message'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Shipment status updated',
            'data' => $log
        ]);
    }
}
