<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_logs', function (Blueprint $col) {
            $col->id();
            $col->foreignId('export_request_id')->constrained()->onDelete('cascade');
            $col->integer('score');
            $col->json('rules_triggered');
            $col->boolean('is_flagged')->default(false);
            $col->text('reviewer_notes')->nullable();
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_logs');
    }
};
