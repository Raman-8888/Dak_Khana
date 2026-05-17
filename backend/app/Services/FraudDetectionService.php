<?php

namespace App\Services;

use App\Models\ExportRequest;

class FraudDetectionService
{
    /**
     * Lightweight rules-based risk scoring for MVP screening.
     *
     * @return array{score:int, flags:array<int, string>, is_risky:bool}
     */
    public function analyze(ExportRequest $request): array
    {
        $request->loadMissing('packageDetail', 'receiverDetail');

        $score = 0;
        $flags = [];

        $weightKg = ((float) ($request->packageDetail->weight_grams ?? 0)) / 1000;
        if ($weightKg > 100) {
            $score += 40;
            $flags[] = 'heavy_shipment';
        }

        $declared = (float) ($request->packageDetail->declared_value ?? 0);
        if ($declared > 500_000) {
            $score += 35;
            $flags[] = 'high_declared_value';
        }

        $country = strtoupper((string) ($request->receiverDetail->country_code ?? ''));
        $sanctioned = ['IR', 'KP', 'SY'];
        if (in_array($country, $sanctioned, true)) {
            $score += 80;
            $flags[] = 'sanctioned_destination';
        }

        if ($request->is_priority) {
            $score += 5;
            $flags[] = 'priority_lane';
        }

        $threshold = (int) config('fraud.threshold', 50);

        return [
            'score'    => min(100, $score),
            'flags'    => $flags,
            'is_risky' => $score >= $threshold,
        ];
    }
}
