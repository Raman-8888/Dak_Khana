<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PricingService;
use Illuminate\Http\Request;

class PricingController extends Controller
{
    public function calculate(Request $request, PricingService $pricing)
    {
        $validated = $request->validate([
            'weight_kg' => 'required|numeric|min:0.001',
            'zone'      => 'required|string|max:64',
        ]);

        $amount = $pricing->calculate(
            (float) $validated['weight_kg'],
            $validated['zone']
        );

        return response()->json([
            'status' => 'success',
            'data'   => [
                'currency'   => config('dakexport.pricing_currency', 'INR'),
                'amount'     => $amount,
                'weight_kg'  => (float) $validated['weight_kg'],
                'zone'       => $validated['zone'],
            ],
        ]);
    }
}
