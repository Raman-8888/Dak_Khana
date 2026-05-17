<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAssignment;
use App\Models\ExportRequest;
use App\Models\User;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->query('from', now()->subDays(30)->toDateString());
        $to = $request->query('to', now()->toDateString());

        $exportsCreated = ExportRequest::query()
            ->whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->count();

        $exportsByStatus = ExportRequest::query()
            ->whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $assignmentsByStatus = DeliveryAssignment::query()
            ->whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->selectRaw('status, COUNT(*) as c')
            ->groupBy('status')
            ->pluck('c', 'status');

        $newUsers = User::query()
            ->whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'period'                 => ['from' => $from, 'to' => $to],
                'exports_created'        => $exportsCreated,
                'exports_by_status'      => $exportsByStatus,
                'assignments_by_status'=> $assignmentsByStatus,
                'new_users'              => $newUsers,
            ],
        ]);
    }
}
