<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAssignment;
use Illuminate\Http\Request;

class PerformanceController extends Controller
{
    public function index(Request $request)
    {
        $agentId = $request->user()->id;

        $counts = DeliveryAssignment::query()
            ->where('agent_id', $agentId)
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $total = $counts->sum();
        $delivered = (int) ($counts['delivered'] ?? 0);
        $failed = (int) ($counts['failed'] ?? 0);
        $active = $total - $delivered - (int) ($counts['cancelled'] ?? 0);

        $successRate = $total > 0 ? round(($delivered / $total) * 100, 1) : 0.0;

        $onTime = DeliveryAssignment::query()
            ->where('agent_id', $agentId)
            ->where('status', 'delivered')
            ->whereNotNull('delivered_at')
            ->whereNotNull('scheduled_for')
            ->whereColumn('delivered_at', '<=', 'scheduled_for')
            ->count();

        $deliveredWithSla = DeliveryAssignment::query()
            ->where('agent_id', $agentId)
            ->where('status', 'delivered')
            ->whereNotNull('scheduled_for')
            ->count();

        $onTimePct = $deliveredWithSla > 0 ? round(($onTime / $deliveredWithSla) * 100, 1) : null;

        return response()->json([
            'success' => true,
            'data'    => [
                'assignments_total'   => $total,
                'delivered'           => $delivered,
                'failed'              => $failed,
                'active_or_other'     => max(0, $active),
                'success_rate_pct'    => $successRate,
                'on_time_pct'         => $onTimePct,
            ],
        ]);
    }
}
