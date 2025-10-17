<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Receiver
            $table->enum('type', [
                'friend_request',
                'friend_request_accepted',
                'new_message',
                'group_post_comment',
                'group_event_created',
                'group_event_reminder',
                'group_member_joined',
                'group_invitation',
                'verification_approved',
                'verification_rejected',
                'event_feedback_received',
                'group_deleted',
                'event_deleted'
            ]);
            $table->json('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
