<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Delivery agent module — runs after export_requests exists.
     */
    public function up(): void
    {
        Schema::create('agent_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 20)->default('active');
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();
            $table->unsignedSmallInteger('total_deliveries')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('agent_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->float('accuracy')->nullable();
            $table->timestamp('recorded_at');
        });

        Schema::create('delivery_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('shipment_id')->constrained('export_requests')->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained('users')->restrictOnDelete();
            $table->string('status', 32)->default('assigned');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('picked_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('scheduled_for')->nullable();
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->text('notes')->nullable();
            $table->string('pending_otp_hash')->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'status']);
            $table->index(['shipment_id']);
        });

        Schema::create('delivery_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('delivery_assignments')->cascadeOnDelete();
            $table->unsignedTinyInteger('attempt_number');
            $table->string('status', 20)->default('failed');
            $table->string('failure_reason')->nullable();
            $table->text('failure_notes')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamp('reattempt_at')->nullable();
            $table->timestamps();
        });

        Schema::create('proof_of_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('delivery_assignments')->cascadeOnDelete();
            $table->boolean('otp_verified')->default(false);
            $table->string('otp_hash')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('signature_url')->nullable();
            $table->string('photo_url')->nullable();
            $table->text('delivery_notes')->nullable();
            $table->timestamp('delivered_at');
            $table->timestamps();
        });

        Schema::create('agent_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('assignment_id')->nullable()->constrained('delivery_assignments')->nullOnDelete();
            $table->decimal('base_pay', 8, 2)->default(0);
            $table->decimal('incentive', 8, 2)->default(0);
            $table->decimal('deduction', 8, 2)->default(0);
            $table->decimal('total', 8, 2)->default(0);
            $table->date('period_date');
            $table->string('status', 20)->default('pending');
            $table->timestamps();

            $table->index(['agent_id', 'period_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_earnings');
        Schema::dropIfExists('proof_of_deliveries');
        Schema::dropIfExists('delivery_attempts');
        Schema::dropIfExists('delivery_assignments');
        Schema::dropIfExists('agent_locations');
        Schema::dropIfExists('agent_shifts');
    }
};
