<?php

// database/migrations/2025_01_10_000001_create_groups_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Grupas galvenā tabula
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('cover_photo')->nullable();
            $table->string('location')->nullable();
            $table->integer('max_members')->nullable(); // Maksimālais dalībnieku skaits
            $table->boolean('is_private')->default(false); // Vai grupa ir privāta
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('creator_id');
            $table->index('is_active');
        });

        // Grupas dalībnieki
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['admin', 'moderator', 'member'])->default('member');
            $table->enum('status', ['pending', 'approved', 'blocked'])->default('approved');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'user_id']);
            $table->index(['group_id', 'status']);
            $table->index('user_id');
        });

        // Grupas sporta veidi
        Schema::create('group_sports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('sport_id')->constrained()->onDelete('cascade');
            $table->enum('skill_level', ['beginner', 'intermediate', 'advanced', 'all'])->default('all');
            $table->timestamps();

            $table->unique(['group_id', 'sport_id']);
        });

        // Grupas pasākumi/aktivitātes
        Schema::create('group_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location');
            $table->datetime('event_date');
            $table->time('duration')->nullable(); // Ilgums
            $table->integer('max_participants')->nullable();
            $table->decimal('price', 8, 2)->nullable(); // Ja ir maksa
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_pattern')->nullable(); // weekly, monthly, etc.
            $table->enum('status', ['upcoming', 'ongoing', 'completed', 'cancelled'])->default('upcoming');
            $table->timestamps();

            $table->index(['group_id', 'event_date']);
            $table->index('status');
        });

        // Pasākumu dalībnieki
        Schema::create('group_event_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('group_events')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['going', 'maybe', 'not_going', 'waiting_list'])->default('going');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
            $table->index(['event_id', 'status']);
        });

        // Grupas ziņas/diskusijas
        Schema::create('group_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('image')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_announcement')->default(false);
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->timestamps();

            $table->index(['group_id', 'created_at']);
            $table->index('user_id');
        });

        // Komentāri pie ziņām
        Schema::create('group_post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('group_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->timestamps();

            $table->index('post_id');
            $table->index('user_id');
        });

        // Patīk reakcijas
        Schema::create('group_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained('group_posts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['post_id', 'user_id']);
        });

        // Grupas uzaicinājumi
        Schema::create('group_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('invited_user')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['group_id', 'invited_user']);
            $table->index(['invited_user', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_invitations');
        Schema::dropIfExists('group_post_likes');
        Schema::dropIfExists('group_post_comments');
        Schema::dropIfExists('group_posts');
        Schema::dropIfExists('group_event_participants');
        Schema::dropIfExists('group_events');
        Schema::dropIfExists('group_sports');
        Schema::dropIfExists('group_members');
        Schema::dropIfExists('groups');
    }
};
