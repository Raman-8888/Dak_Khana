<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Inbound webhook sink (payment providers, carrier events, etc.).
     */
    public function handle(Request $request)
    {
        Log::info('webhook.received', [
            'payload' => $request->all(),
            'ip'      => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Webhook accepted.',
        ], 202);
    }
}
