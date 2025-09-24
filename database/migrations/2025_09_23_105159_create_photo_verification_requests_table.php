<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photo_verification_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');

            // Verification photos
            $table->string('selfie_photo')->comment('Real-time selfie');
            $table->string('id_document_photo')->comment('ID document photo');
            $table->string('selfie_with_id_photo')->nullable()->comment('Selfie holding ID');

            // Verification data
            $table->string('verification_code')->comment('Code shown in selfie');
            $table->json('metadata')->nullable()->comment('Additional verification data');

            // Review info
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->timestamp('expires_at')->nullable();

            $table->index(['user_id', 'status']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_verification_requests');
    }
};
