<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Auth ──────────────────────────────────────────────────────────────────────
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\TwoFactorController;
use App\Http\Controllers\Api\V1\Auth\TokenController;

// ── Admin ─────────────────────────────────────────────────────────────────────
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\FraudQueueController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;

// ── Customer ──────────────────────────────────────────────────────────────────
use App\Http\Controllers\Api\V1\ExportRequestController;
use App\Http\Controllers\Api\V1\DocumentController;

// ── Public ────────────────────────────────────────────────────────────────────
use App\Http\Controllers\Api\V1\PricingController;
use App\Http\Controllers\Api\V1\ShipmentTrackingController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\HealthCheckController;

use App\Http\Controllers\Api\V1\Agent\AssignmentController;
use App\Http\Controllers\Api\V1\Agent\EarningsController;
use App\Http\Controllers\Api\V1\Agent\LocationController;
use App\Http\Controllers\Api\V1\Agent\PerformanceController;
use App\Http\Controllers\Api\V1\Agent\ShiftController;
use App\Http\Controllers\Api\V1\Ops\ShipmentController;
use App\Http\Controllers\Api\V1\Warehouse\ScanController;

Route::prefix('v1')->group(function () {

    // ── PUBLIC: No auth required ───────────────────────────────────────────────
    Route::prefix('public')->group(function () {
        Route::get('pricing/calculate',            [PricingController::class,          'calculate']);
        Route::get('tracking/{tracking_number}',   [ShipmentTrackingController::class, 'show']);
        Route::post('webhooks',                    [WebhookController::class,          'handle']);
        Route::get('health',                       [HealthCheckController::class,      'index']);
    });

    // ── AUTH: Registration & Login (public) ───────────────────────────────────
    Route::prefix('auth')->group(function () {
        Route::post('login',        [AuthController::class, 'login']);
        Route::post('register',     [AuthController::class, 'register']);
        Route::post('token/refresh',[TokenController::class,'refresh']);

        // Protected auth actions
        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout',       [AuthController::class,      'logout']);
            Route::get('me',            [AuthController::class,      'me']);
            Route::post('2fa/enable',   [TwoFactorController::class, 'enable']);
            Route::post('2fa/verify',   [TwoFactorController::class, 'verify']);
        });
    });

    // ── CUSTOMER routes ────────────────────────────────────────────────────────
    Route::prefix('customer')
        ->middleware(['auth:sanctum', 'role:customer'])
        ->group(function () {
            Route::apiResource('exports',   ExportRequestController::class);
            Route::post('exports/{id}/pay', [ExportRequestController::class, 'pay']);
            Route::get('documents',                         [DocumentController::class, 'index']);
            Route::get('documents/{id}/download',           [DocumentController::class, 'download']);
        });

    // ── DELIVERY AGENT routes ──────────────────────────────────────────────────
    Route::prefix('agent')
        ->middleware(['auth:sanctum', 'role:delivery_agent'])
        ->group(function () {
            Route::get('assignments/available',    [AssignmentController::class, 'available']);
            Route::post('assignments/self-assign/{id}', [AssignmentController::class, 'selfAssign']);
            Route::get('assignments',              [AssignmentController::class, 'index']);
            Route::post('assignments/{id}/pickup', [AssignmentController::class, 'pickup']);
            Route::post('assignments/{id}/deliver', [AssignmentController::class, 'deliver']);
            Route::post('assignments/{id}/fail',   [AssignmentController::class, 'fail']);

            Route::get('shift',        [ShiftController::class, 'show']);
            Route::post('shift/start', [ShiftController::class, 'start']);
            Route::post('shift/end',   [ShiftController::class, 'end']);

            Route::post('location',    [LocationController::class, 'ping']);

            Route::get('earnings',     [EarningsController::class, 'index']);
            Route::get('performance',  [PerformanceController::class, 'index']);
        });

    // ── OPERATIONS EXECUTIVE routes ────────────────────────────────────────────
    Route::prefix('ops')
        ->middleware(['auth:sanctum', 'role:operations_executive,admin,super_admin'])
        ->group(function () {
            Route::get('shipments',                    [ShipmentController::class, 'index']);
            Route::post('shipments/{export}/assign',   [ShipmentController::class, 'assign']);
        });

    // ── WAREHOUSE MANAGER routes ───────────────────────────────────────────────
    Route::prefix('warehouse')
        ->middleware(['auth:sanctum', 'role:warehouse_manager,admin,super_admin'])
        ->group(function () {
            Route::post('scan', [ScanController::class, 'store']);
        });

    // ── ADMIN / SUPER ADMIN routes ─────────────────────────────────────────────
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'role:admin,super_admin'])
        ->group(function () {
            Route::get('dashboard',              [AdminDashboardController::class,  'index']);
            Route::apiResource('fraud-queue',     FraudQueueController::class);
            Route::get('reports',                [ReportController::class,          'index']);
            Route::apiResource('users',           UserManagementController::class);
        });

    // ── SHARED: Authenticated users (any role) ─────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('notifications', function (Request $request) {
            return response()->json(['notifications' => []]);
        });
    });
});
