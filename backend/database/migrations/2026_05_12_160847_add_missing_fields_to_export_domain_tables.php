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
        Schema::table('receiver_details', function (Blueprint $table) {
            $table->decimal('distance', 10, 2)->nullable()->after('phone');
        });

        Schema::table('package_details', function (Blueprint $table) {
            $table->string('product_type')->nullable()->after('request_id');
            $table->string('image_url')->nullable()->after('declared_value');
            $table->string('document_url')->nullable()->after('image_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receiver_details', function (Blueprint $table) {
            $table->dropColumn('distance');
        });

        Schema::table('package_details', function (Blueprint $table) {
            $table->dropColumn(['product_type', 'image_url', 'document_url']);
        });
    }
};
