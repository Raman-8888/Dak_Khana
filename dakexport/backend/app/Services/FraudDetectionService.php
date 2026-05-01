<?php

namespace App\Services;

class FraudDetectionService
{
    /**
     * Run fraud analysis on an export request.
     * 
     * @param \App\Models\ExportRequest $request
     * @return array
     */
    public function analyze($request)
    {
        // Placeholder for rule scoring + z-score analysis
        $score = 0;
        $flags = [];

        return [
            'score' => $score,
            'flags' => $flags,
            'is_risky' => $score > config('fraud.threshold', 50),
        ];
    }
}
