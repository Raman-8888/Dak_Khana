<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PricingRule;

class PricingRulesSeeder extends Seeder
{
    public function run(): void
    {
        PricingRule::create(['zone' => 'Zone 1', 'weight_min' => 0, 'weight_max' => 500, 'price' => 10.00, 'currency' => 'INR']);
        PricingRule::create(['zone' => 'Zone 2', 'weight_min' => 0, 'weight_max' => 500, 'price' => 15.00, 'currency' => 'INR']);
    }
}
