<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PricingRule;

class PricingRulesSeeder extends Seeder
{
    public function run(): void
    {
        PricingRule::create(['zone' => 'Zone 1', 'weight_min' => 0, 'weight_max' => 5, 'price' => 10.00]);
        PricingRule::create(['zone' => 'Zone 2', 'weight_min' => 0, 'weight_max' => 5, 'price' => 15.00]);
    }
}
