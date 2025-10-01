<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_event_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('group_events')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->comment('1-5 stars');
            $table->text('comment')->nullable();
            $table->boolean('would_recommend')->default(true);

            // Additional feedback fields
            $table->enum('organization_rating', ['poor', 'fair', 'good', 'excellent'])->nullable();
            $table->enum('location_rating', ['poor', 'fair', 'good', 'excellent'])->nullable();
            $table->enum('value_rating', ['poor', 'fair', 'good', 'excellent'])->nullable();

            $table->timestamps();

            // Ensure one feedback per user per event
            $table->unique(['event_id', 'user_id']);

            $table->index('event_id');
            $table->index('user_id');
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_event_feedback');
    }
};
