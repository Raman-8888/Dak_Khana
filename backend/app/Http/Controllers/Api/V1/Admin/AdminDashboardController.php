<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryAssignment;
use App\Models\ExportRequest;
use App\Models\FraudLog;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'users_total'          => User::query()->count(),
                'users_by_role'        => User::query()->selectRaw('role, COUNT(*) as c')->groupBy('role')->pluck('c', 'role'),
                'exports_total'        => ExportRequest::query()->count(),
                'exports_by_status'    => ExportRequest::query()->selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status'),
                'assignments_open'     => DeliveryAssignment::query()->whereNotIn('status', ['delivered', 'cancelled'])->count(),
                'fraud_queue_open'     => FraudLog::query()->where('is_flagged', true)->count(),
            ],
        ]);
    }
}
