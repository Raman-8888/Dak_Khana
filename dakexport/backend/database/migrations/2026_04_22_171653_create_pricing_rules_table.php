<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $col) {
            $col->id();
            $col->string('zone');
            $col->decimal('weight_min', 8, 2);
            $col->decimal('weight_max', 8, 2);
            $col->decimal('price', 10, 2);
            $col->string('currency')->default('USD');
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
