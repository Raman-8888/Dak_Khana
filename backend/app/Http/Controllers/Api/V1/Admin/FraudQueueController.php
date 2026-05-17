<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\FraudLog;
use Illuminate\Http\Request;

class FraudQueueController extends Controller
{
    public function index(Request $request)
    {
        $logs = FraudLog::query()
            ->with(['exportRequest' => function ($q) {
                $q->select('id', 'tracking_number', 'status', 'customer_id', 'created_at');
            }])
            ->where('is_flagged', true)
            ->orderByDesc('created_at')
            ->paginate(min((int) $request->query('per_page', 25), 100));

        return response()->json([
            'success' => true,
            'data'    => $logs,
        ]);
    }

    public function show(string $id)
    {
        $log = FraudLog::query()->with('exportRequest')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $log,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'is_flagged'     => 'sometimes|boolean',
            'reviewer_notes' => 'nullable|string|max:2000',
        ]);

        $log = FraudLog::query()->findOrFail($id);
        $log->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Fraud record updated.',
            'data'    => $log->fresh(),
        ]);
    }

    public function store(Request $request)
    {
        return response()->json(['success' => false, 'message' => 'Not supported.'], 405);
    }

    public function destroy(string $id)
    {
        return response()->json(['success' => false, 'message' => 'Not supported.'], 405);
    }
}
