<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentShift;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function show(Request $request)
    {
        $shift = AgentShift::query()
            ->where('agent_id', $request->user()->id)
            ->where('status', 'active')
            ->latest('started_at')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => $shift,
        ]);
    }

    public function start(Request $request)
    {
        $existing = AgentShift::query()
            ->where('agent_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => true,
                'message' => 'Shift already active.',
                'data'    => $existing,
            ]);
        }

        $shift = AgentShift::create([
            'agent_id'         => $request->user()->id,
            'status'           => 'active',
            'started_at'       => now(),
            'total_deliveries' => 0,
            'total_earnings'   => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift started.',
            'data'    => $shift,
        ], 201);
    }

    public function end(Request $request)
    {
        $shift = AgentShift::query()
            ->where('agent_id', $request->user()->id)
            ->where('status', 'active')
            ->latest('started_at')
            ->firstOrFail();

        $shift->update([
            'status'   => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift ended.',
            'data'    => $shift->fresh(),
        ]);
    }
}
