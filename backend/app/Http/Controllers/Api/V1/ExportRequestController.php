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
                ->with(['trackingEvents', 'receiverDetail', 'packageDetail', 'senderDetail'])
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
        // Validate with nested field rules to catch missing required fields early
        $request->validate([
            'service_type_id'          => 'required|string',

            // Sender
            'sender'                   => 'required|array',
            'sender.name'              => 'required|string|max:255',
            'sender.address'           => 'required|string|max:500',
            'sender.city'              => 'required|string|max:100',
            'sender.state'             => 'required|string|max:64',
            'sender.postal_code'       => 'required|string|max:32',
            'sender.phone'             => 'required|string|max:32',
            'sender.email'             => 'nullable|email',

            // Receiver
            'receiver'                 => 'required|array',
            'receiver.name'            => 'required|string|max:255',
            'receiver.address'         => 'nullable|string|max:500',
            'receiver.from_address'    => 'required|string|max:500',
            'receiver.to_address'      => 'required|string|max:500',
            'receiver.city'            => 'required|string|max:100',
            'receiver.state'           => 'required|string|max:64',
            'receiver.postal_code'     => 'required|string|max:32',
            'receiver.country_code'    => 'required|string|max:4',
            'receiver.phone'           => 'required|string|max:32',
            'receiver.email'           => 'nullable|email',

            // Package
            'package'                  => 'required|array',
            'package.weight_grams'     => 'required|numeric|min:1',
            'package.content_description' => 'required|string|max:500',
            'package.product_type'     => 'nullable|string|max:64',
        ], [
            'sender.address.required'           => 'Sender address (From Address) is required.',
            'sender.name.required'              => 'Sender name is required.',
            'sender.city.required'              => 'Sender city is required.',
            'sender.state.required'             => 'Sender state is required.',
            'sender.postal_code.required'       => 'Sender postal code is required.',
            'sender.phone.required'             => 'Sender phone is required.',
            'receiver.name.required'            => 'Receiver name is required.',
            'receiver.address.required'         => 'Receiver address (To Address) is required.',
            'receiver.from_address.required'    => 'From Address is required.',
            'receiver.to_address.required'      => 'To Address is required.',
            'receiver.city.required'            => 'Receiver city is required.',
            'receiver.state.required'           => 'Receiver state is required.',
            'receiver.postal_code.required'     => 'Receiver postal code is required.',
            'receiver.country_code.required'    => 'Receiver country code is required.',
            'receiver.phone.required'           => 'Receiver phone is required.',
            'package.weight_grams.required'     => 'Package weight is required.',
            'package.weight_grams.min'          => 'Package weight must be at least 1 gram.',
            'package.content_description.required' => 'Package content description is required.',
        ]);

        try {
            $exportRequest = ExportRequest::create([
                'customer_id'     => auth()->id(),
                'service_type_id' => $request->input('service_type_id'),
                'status'          => 'draft',
            ]);

            $exportRequest->senderDetail()->create($request->input('sender'));

            // Ensure receiver.address is populated from to_address for DB NOT NULL constraint
            $receiverData = $request->input('receiver');
            if (empty($receiverData['address'])) {
                $receiverData['address'] = $receiverData['to_address'];
            }
            $exportRequest->receiverDetail()->create($receiverData);
            $exportRequest->packageDetail()->create($request->input('package'));

            // Create initial tracking event
            $exportRequest->trackingEvents()->create([
                'status'   => 'draft',
                'location' => 'Online Portal',
                'notes'    => 'Export request draft created.',
            ]);

            $analysis = app(FraudDetectionService::class)->analyze($exportRequest);
            FraudLog::create([
                'export_request_id' => $exportRequest->id,
                'score'             => $analysis['score'],
                'rules_triggered'   => $analysis['flags'],
                'is_flagged'        => $analysis['is_risky'] ? 'true' : 'false',
            ]);

            return response()->json([
                'status'  => 'success',
                'message' => 'Export request created successfully',
                'data'    => $exportRequest->load(['senderDetail', 'receiverDetail', 'packageDetail', 'trackingEvents']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Server Error: ' . $e->getMessage(),
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

    public function pay(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric'
        ]);

        try {
            $exportRequest = ExportRequest::where('customer_id', auth()->id())->findOrFail($id);

            \App\Models\Payment::create([
                'request_id' => $exportRequest->id,
                'status'     => 'successful',
                'amount'     => $validated['amount'],
                'currency'   => 'USD',
                'provider'   => 'dummy_razorpay',
                'reference'  => 'txn_' . \Illuminate\Support\Str::random(10)
            ]);

            $exportRequest->trackingEvents()->create([
                'status'   => 'payment_completed',
                'location' => 'Online Portal',
                'notes'    => 'Payment of $' . $validated['amount'] . ' successful.'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment recorded successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}
