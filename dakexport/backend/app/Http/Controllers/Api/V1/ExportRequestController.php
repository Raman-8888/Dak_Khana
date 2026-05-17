<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExportRequest;
use App\Models\FraudLog;
use App\Services\FraudDetectionService;
use Illuminate\Http\Request;

class ExportRequestController extends Controller
{
    public function index()
    {
        try {
            $exports = ExportRequest::where('customer_id', auth()->id())
                ->with(['trackingEvents', 'receiverDetail', 'packageDetail'])
                ->latest()
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $exports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'service_type_id' => 'required|string',
                'sender' => 'required|array',
                'receiver' => 'required|array',
                'package' => 'required|array',
            ]);

            $exportRequest = ExportRequest::create([
                'customer_id' => auth()->id(),
                'service_type_id' => $validated['service_type_id'],
                'status' => 'draft',
            ]);

            $exportRequest->senderDetail()->create($validated['sender']);
            $exportRequest->receiverDetail()->create($validated['receiver']);
            $exportRequest->packageDetail()->create($validated['package']);

            // Create initial tracking event
            $exportRequest->trackingEvents()->create([
                'status' => 'draft',
                'location' => 'Online Portal',
                'notes' => 'Export request draft created.'
            ]);

            $analysis = app(FraudDetectionService::class)->analyze($exportRequest);
            FraudLog::create([
                'export_request_id' => $exportRequest->id,
                'score'             => $analysis['score'],
                'rules_triggered'   => $analysis['flags'],
                'is_flagged'        => $analysis['is_risky'],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Export request created successfully',
                'data' => $exportRequest->load(['senderDetail', 'receiverDetail', 'packageDetail', 'trackingEvents'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $exportRequest = ExportRequest::where('customer_id', auth()->id())
                ->with(['senderDetail', 'receiverDetail', 'packageDetail', 'trackingEvents', 'documents', 'payments'])
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => $exportRequest
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
    public function update(Request $request, $id)
    {
        try {
            $exportRequest = ExportRequest::where('customer_id', auth()->id())->findOrFail($id);

            $validated = $request->validate([
                'status'      => 'sometimes|string|max:40',
                'is_priority' => 'sometimes|boolean',
            ]);

            $exportRequest->update($validated);

            if (! empty($validated['status'])) {
                $exportRequest->trackingEvents()->create([
                    'status'   => $validated['status'],
                    'location' => 'Customer portal',
                    'notes'    => 'Shipment updated by customer.',
                ]);
            }

            return response()->json([
                'status'  => 'success',
                'message' => 'Export request updated',
                'data'    => $exportRequest->fresh()->load(['senderDetail', 'receiverDetail', 'packageDetail', 'trackingEvents']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Error: '.$e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $exportRequest = ExportRequest::where('customer_id', auth()->id())->findOrFail($id);
            $exportRequest->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Export request deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
