<?php

namespace App\Http\Controllers\Api\V1\Ops;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAssignment;
use App\Models\ExportRequest;
use App\Models\User;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = ExportRequest::query()
            ->with(['customer', 'receiverDetail', 'packageDetail', 'deliveryAssignments.agent'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $shipments = $query->paginate(min((int) $request->query('per_page', 30), 100));

        return response()->json([
            'success' => true,
            'data'    => $shipments,
        ]);
    }

    public function assign(Request $request, string $exportId)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:users,id',
        ]);

        $agent = User::query()->whereKey($validated['agent_id'])->firstOrFail();
        if ($agent->role !== 'delivery_agent') {
            return response()->json([
                'success' => false,
                'message' => 'Selected user is not a delivery agent.',
            ], 422);
        }

        $export = ExportRequest::query()->findOrFail($exportId);

        $open = DeliveryAssignment::query()
            ->where('shipment_id', $export->id)
            ->whereNotIn('status', ['delivered', 'cancelled', 'failed'])
            ->exists();

        if ($open) {
            return response()->json([
                'success' => false,
                'message' => 'Shipment already has an active assignment. Reassign or close it first.',
            ], 422);
        }

        $assignment = DeliveryAssignment::create([
            'shipment_id' => $export->id,
            'agent_id'    => $agent->id,
            'status'      => 'assigned',
            'assigned_at' => now(),
        ]);

        $export->update([
            'status'            => 'processing',
            'assigned_staff_id' => $request->user()->id,
        ]);

        $export->trackingEvents()->create([
            'status'   => 'processing',
            'location' => 'Operations',
            'notes'    => 'Assigned to agent '.$agent->name,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agent assigned.',
            'data'    => $assignment->load('agent', 'shipment'),
        ], 201);
    }
}
