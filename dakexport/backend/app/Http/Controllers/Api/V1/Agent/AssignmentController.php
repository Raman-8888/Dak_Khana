<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentEarning;
use App\Models\AgentShift;
use App\Models\DeliveryAssignment;
use App\Models\DeliveryAttempt;
use App\Models\ProofOfDelivery;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $assignments = DeliveryAssignment::query()
            ->where('agent_id', $request->user()->id)
            ->with(['shipment.receiverDetail', 'shipment.packageDetail', 'proofOfDelivery'])
            ->orderByRaw("CASE status WHEN 'assigned' THEN 0 WHEN 'picked_up' THEN 1 WHEN 'in_transit' THEN 2 ELSE 3 END")
            ->orderByDesc('assigned_at')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $assignments,
        ]);
    }

    public function pickup(Request $request, int $id)
    {
        $assignment = DeliveryAssignment::query()
            ->where('agent_id', $request->user()->id)
            ->whereKey($id)
            ->firstOrFail();

        if (! in_array($assignment->status, ['assigned', 'rescheduled'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'This shipment cannot be picked up in its current state.',
            ], 422);
        }

        $otp = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        $assignment->update([
            'status'            => 'in_transit',
            'picked_at'         => now(),
            'attempt_count'     => $assignment->attempt_count + 1,
            'pending_otp_hash'  => Hash::make($otp),
        ]);

        $assignment->shipment->update(['status' => 'in_transit']);
        $assignment->shipment->trackingEvents()->create([
            'status'   => 'in_transit',
            'location' => 'Field — pickup confirmed',
            'notes'    => 'Picked up by agent '.$request->user()->name,
        ]);

        $payload = [
            'success' => true,
            'message' => 'Pickup recorded. Share the OTP with the recipient for delivery.',
            'data'    => $assignment->fresh()->load(['shipment.receiverDetail', 'shipment.packageDetail']),
        ];

        if (config('app.debug')) {
            $payload['dev_otp'] = $otp;
        }

        return response()->json($payload);
    }

    public function deliver(Request $request, int $id)
    {
        $validated = $request->validate([
            'otp'             => 'required|string|size:4',
            'recipient_name'  => 'required|string|max:120',
            'signature_url'   => 'nullable|string|max:2048',
            'photo_url'         => 'nullable|string|max:2048',
            'delivery_notes'    => 'nullable|string|max:2000',
        ]);

        $assignment = DeliveryAssignment::query()
            ->where('agent_id', $request->user()->id)
            ->whereKey($id)
            ->firstOrFail();

        if (! in_array($assignment->status, ['in_transit', 'picked_up'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Shipment is not out for delivery.',
            ], 422);
        }

        if (! $assignment->pending_otp_hash || ! Hash::check($validated['otp'], $assignment->pending_otp_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid delivery OTP.',
            ], 422);
        }

        return DB::transaction(function () use ($assignment, $validated, $request) {
            $now = now();

            ProofOfDelivery::create([
                'assignment_id'   => $assignment->id,
                'otp_verified'    => true,
                'recipient_name'  => $validated['recipient_name'],
                'signature_url'   => $validated['signature_url'] ?? null,
                'photo_url'       => $validated['photo_url'] ?? null,
                'delivery_notes'  => $validated['delivery_notes'] ?? null,
                'delivered_at'    => $now,
            ]);

            $assignment->update([
                'status'             => 'delivered',
                'delivered_at'       => $now,
                'pending_otp_hash'   => null,
            ]);

            $shipment = $assignment->shipment;
            $shipment->update(['status' => 'delivered']);
            $shipment->trackingEvents()->create([
                'status'   => 'delivered',
                'location' => 'Destination',
                'notes'    => 'Delivered to '.($validated['recipient_name'] ?? 'recipient'),
            ]);
            $shipment->shipmentLogs()->create([
                'status'   => 'delivered',
                'location' => 'Destination',
                'message'  => 'Proof of delivery captured.',
            ]);

            $basePay = (float) config('dakexport.agent_base_delivery_pay', 75);
            $incentive = $shipment->is_priority ? (float) config('dakexport.agent_priority_bonus', 25) : 0.0;
            $total = $basePay + $incentive;

            AgentEarning::create([
                'agent_id'       => $request->user()->id,
                'assignment_id'=> $assignment->id,
                'base_pay'       => $basePay,
                'incentive'      => $incentive,
                'deduction'      => 0,
                'total'          => $total,
                'period_date'    => Carbon::today()->toDateString(),
                'status'         => 'pending',
            ]);

            AgentShift::query()
                ->where('agent_id', $request->user()->id)
                ->where('status', 'active')
                ->increment('total_deliveries');

            AgentShift::query()
                ->where('agent_id', $request->user()->id)
                ->where('status', 'active')
                ->increment('total_earnings', $total);

            return response()->json([
                'success' => true,
                'message' => 'Delivery completed.',
                'data'    => $assignment->fresh()->load(['shipment', 'proofOfDelivery']),
            ]);
        });
    }

    public function fail(Request $request, int $id)
    {
        $validated = $request->validate([
            'failure_reason' => 'required|string|max:255',
            'failure_notes'  => 'nullable|string|max:2000',
            'reattempt_at'   => 'nullable|date',
        ]);

        $assignment = DeliveryAssignment::query()
            ->where('agent_id', $request->user()->id)
            ->whereKey($id)
            ->firstOrFail();

        if (in_array($assignment->status, ['delivered', 'cancelled'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'This assignment is already closed.',
            ], 422);
        }

        return DB::transaction(function () use ($assignment, $validated, $request) {
            $assignment->update([
                'status'         => 'failed',
                'scheduled_for'  => $validated['reattempt_at'] ?? null,
            ]);

            DeliveryAttempt::create([
                'assignment_id'  => $assignment->id,
                'attempt_number' => max(1, (int) $assignment->attempt_count),
                'status'         => 'failed',
                'failure_reason' => $validated['failure_reason'],
                'failure_notes'  => $validated['failure_notes'] ?? null,
                'attempted_at'   => now(),
                'reattempt_at'   => $validated['reattempt_at'] ?? null,
            ]);

            $assignment->shipment->update(['status' => 'on_hold']);
            $assignment->shipment->trackingEvents()->create([
                'status'   => 'on_hold',
                'location' => 'Field',
                'notes'    => 'Delivery failed: '.$validated['failure_reason'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Failure recorded. Operations will be notified.',
                'data'    => $assignment->fresh()->load(['attempts']),
            ]);
        });
    }
}
