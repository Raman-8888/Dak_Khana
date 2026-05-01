<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $col) {
            $col->id();
            $col->foreignId('export_request_id')->constrained()->onDelete('cascade');
            $col->string('type');
            $col->string('file_path');
            $col->json('metadata')->nullable();
            $col->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
