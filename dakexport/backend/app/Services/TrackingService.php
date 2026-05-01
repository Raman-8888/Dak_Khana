<?php

namespace App\Services;

use App\Models\ExportRequest;

class TrackingService
{
    /**
     * Update and manage shipment status.
     * 
     * @param ExportRequest $request
     * @param string $status
     * @param array $payload
     * @return void
     */
    public function updateStatus(ExportRequest $request, $status, $payload = [])
    {
        $request->shipmentLogs()->create([
            'status' => $status,
            'location' => $payload['location'] ?? 'Unknown',
            'message' => $payload['message'] ?? '',
        ]);
    }
}
