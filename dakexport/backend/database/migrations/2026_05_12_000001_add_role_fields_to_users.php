<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'customer',
                'delivery_agent',
                'operations_executive',
                'warehouse_manager',
                'finance',
                'compliance_officer',
                'support_agent',
                'regional_manager',
                'admin',
                'super_admin',
            ])->default('customer')->after('email');

            $table->boolean('is_active')->default(true)->after('role');
            $table->string('phone', 20)->nullable()->after('is_active');
            $table->string('avatar')->nullable()->after('phone');
            $table->string('employee_id')->nullable()->after('avatar'); // Internal staff only
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'phone', 'avatar', 'employee_id']);
        });
    }
};
