<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentLocation;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function ping(Request $request)
    {
        $validated = $request->validate([
            'lat'         => 'required|numeric',
            'lng'         => 'required|numeric',
            'accuracy'    => 'nullable|numeric',
            'recorded_at' => 'nullable|date',
        ]);

        AgentLocation::create([
            'agent_id'    => $request->user()->id,
            'lat'         => $validated['lat'],
            'lng'         => $validated['lng'],
            'accuracy'    => $validated['accuracy'] ?? null,
            'recorded_at' => isset($validated['recorded_at'])
                ? \Carbon\Carbon::parse($validated['recorded_at'])
                : now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Location recorded.',
        ], 201);
    }
}
