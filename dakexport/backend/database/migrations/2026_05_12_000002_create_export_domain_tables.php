<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('export_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->string('tracking_number', 40)->unique();
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('service_type_id')->nullable();
            $table->string('status', 40)->default('draft');
            $table->boolean('is_priority')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->decimal('total_charges', 12, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('sender_details', function (Blueprint $table) {
            $table->foreignUuid('request_id')->primary()->constrained('export_requests')->cascadeOnDelete();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state', 64);
            $table->string('postal_code', 32);
            $table->string('phone', 32);
            $table->string('email')->nullable();
        });

        Schema::create('receiver_details', function (Blueprint $table) {
            $table->foreignUuid('request_id')->primary()->constrained('export_requests')->cascadeOnDelete();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state', 64);
            $table->string('postal_code', 32);
            $table->string('country_code', 4);
            $table->string('phone', 32);
            $table->string('email')->nullable();
        });

        Schema::create('package_details', function (Blueprint $table) {
            $table->foreignUuid('request_id')->primary()->constrained('export_requests')->cascadeOnDelete();
            $table->unsignedInteger('weight_grams')->default(0);
            $table->decimal('length_cm', 8, 2)->nullable();
            $table->decimal('width_cm', 8, 2)->nullable();
            $table->decimal('height_cm', 8, 2)->nullable();
            $table->text('content_description')->nullable();
            $table->string('hs_code', 32)->nullable();
            $table->decimal('declared_value', 12, 2)->nullable();
            $table->string('currency', 8)->default('INR');
        });

        Schema::create('tracking_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('request_id')->constrained('export_requests')->cascadeOnDelete();
            $table->string('status', 64);
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('request_id')->constrained('export_requests')->cascadeOnDelete();
            $table->string('type', 64)->default('other');
            $table->string('file_path');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('request_id')->constrained('export_requests')->cascadeOnDelete();
            $table->string('status', 32)->default('pending');
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('currency', 8)->default('INR');
            $table->string('provider', 64)->nullable();
            $table->string('reference', 128)->nullable();
            $table->timestamps();
        });

        Schema::create('shipment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('export_request_id')->constrained('export_requests')->cascadeOnDelete();
            $table->string('status', 64);
            $table->string('location')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });

        Schema::create('fraud_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('export_request_id')->constrained('export_requests')->cascadeOnDelete();
            $table->unsignedSmallInteger('score')->default(0);
            $table->json('rules_triggered')->nullable();
            $table->boolean('is_flagged')->default(false);
            $table->text('reviewer_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->string('zone', 64);
            $table->decimal('weight_min', 10, 3)->default(0);
            $table->decimal('weight_max', 10, 3);
            $table->decimal('price', 12, 2);
            $table->string('currency', 8)->default('INR');
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 128);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('pricing_rules');
        Schema::dropIfExists('fraud_logs');
        Schema::dropIfExists('shipment_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('documents');
        Schema::dropIfExists('tracking_events');
        Schema::dropIfExists('package_details');
        Schema::dropIfExists('receiver_details');
        Schema::dropIfExists('sender_details');
        Schema::dropIfExists('export_requests');
    }
};
