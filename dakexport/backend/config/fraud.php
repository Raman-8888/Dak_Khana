<?php

return [
    'threshold' => env('FRAUD_THRESHOLD', 50),
    'rules' => [
        'high_value' => 20,
        'unusual_destination' => 30,
        'weight_mismatch' => 15,
    ],
];
