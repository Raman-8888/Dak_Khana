<?php

namespace App\Services;

use App\Models\PricingRule;

class PricingService
{
    /**
     * Estimate price from weight (kg) and destination zone label.
     * Uses the best matching pricing_rules row, or a configured per-kg fallback.
     */
    public function calculate(float $weightKg, string $zone): float
    {
        $zone = trim($zone);

        $rule = PricingRule::query()
            ->where('zone', $zone)
            ->where('weight_min', '<=', $weightKg)
            ->where('weight_max', '>=', $weightKg)
            ->orderBy('price')
            ->first();

        if ($rule) {
            return round((float) $rule->price * $weightKg, 2);
        }

        $fallback = (float) config('dakexport.fallback_price_per_kg', 12.5);

        return round($weightKg * $fallback, 2);
    }
}
