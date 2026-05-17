<?php

namespace App\Http\Controllers\Api\V1\Agent;

use App\Http\Controllers\Controller;
use App\Models\AgentEarning;
use Illuminate\Http\Request;

class EarningsController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->query('from', now()->subDays(30)->toDateString());
        $to = $request->query('to', now()->toDateString());

        $rows = AgentEarning::query()
            ->where('agent_id', $request->user()->id)
            ->whereBetween('period_date', [$from, $to])
            ->orderByDesc('period_date')
            ->get();

        $summary = AgentEarning::query()
            ->where('agent_id', $request->user()->id)
            ->whereBetween('period_date', [$from, $to])
            ->selectRaw('COALESCE(SUM(total),0) as total_amount, COUNT(*) as entries')
            ->first();

        return response()->json([
            'success' => true,
            'data'    => [
                'summary' => $summary,
                'entries' => $rows,
            ],
        ]);
    }
}
