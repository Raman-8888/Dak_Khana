<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receiver_details', function (Blueprint $table) {
            // Add separate from/to address fields alongside the existing address column
            $table->string('from_address')->nullable()->after('address');
            $table->string('to_address')->nullable()->after('from_address');
        });
    }

    public function down(): void
    {
        Schema::table('receiver_details', function (Blueprint $table) {
            $table->dropColumn(['from_address', 'to_address']);
        });
    }
};
