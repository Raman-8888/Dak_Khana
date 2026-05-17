<?php

return [
    'pricing_currency'        => env('DAK_PRICING_CURRENCY', 'INR'),
    'fallback_price_per_kg'   => (float) env('DAK_FALLBACK_PRICE_PER_KG', 12.5),
    'agent_base_delivery_pay' => (float) env('DAK_AGENT_BASE_DELIVERY_PAY', 75),
    'agent_priority_bonus'    => (float) env('DAK_AGENT_PRIORITY_BONUS', 25),
];
