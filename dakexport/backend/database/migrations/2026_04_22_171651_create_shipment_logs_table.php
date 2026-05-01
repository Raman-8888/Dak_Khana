<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipment_logs', function (Blueprint $col) {
            $col->id();
            $col->foreignId('export_request_id')->constrained()->onDelete('cascade');
            $col->string('status');
            $col->string('location');
            $col->text('message')->nullable();
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipment_logs');
    }
};
