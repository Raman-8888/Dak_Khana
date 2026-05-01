<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\TwoFactorController;
use App\Http\Controllers\Api\V1\Auth\TokenController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\FraudQueueController;
use App\Http\Controllers\Api\V1\Admin\ReportController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;
use App\Http\Controllers\Api\V1\ExportRequestController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\PricingController;
use App\Http\Controllers\Api\V1\ShipmentTrackingController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Controllers\Api\V1\HealthCheckController;

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::post('2fa/enable', [TwoFactorController::class, 'enable'])->middleware('auth:sanctum');
        Route::post('2fa/verify', [TwoFactorController::class, 'verify'])->middleware('auth:sanctum');
        Route::post('token/refresh', [TokenController::class, 'refresh']);
    });

    // Admin Routes
    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index']);
        Route::apiResource('fraud-queue', FraudQueueController::class);
        Route::get('reports', [ReportController::class, 'index']);
        Route::apiResource('users', UserManagementController::class);
    });

    // Customer Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('exports', ExportRequestController::class);
        Route::get('documents', [DocumentController::class, 'index']);
        Route::get('documents/{id}/download', [DocumentController::class, 'download']);
    });

    // Public Routes
    Route::get('pricing/calculate', [PricingController::class, 'calculate']);
    Route::get('tracking/{tracking_number}', [ShipmentTrackingController::class, 'show']);
    Route::post('webhooks', [WebhookController::class, 'handle']);
    Route::get('health', [HealthCheckController::class, 'index']);
});
