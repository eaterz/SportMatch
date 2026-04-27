<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Friendship;
use App\Models\Message;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'lastname',
        'email',
        'password',
        'is_admin',
        'oauth_provider',
        'oauth_id',
        'email_verified_at',
        'pending_email',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function sports(): BelongsToMany
    {
        return $this->belongsToMany(Sport::class, 'user_sports')
            ->withPivot('skill_level', 'is_preferred')
            ->withTimestamps();
    }

    public function userSports(): HasMany
    {
        return $this->hasMany(UserSport::class);
    }

    public function availabilitySchedules(): HasMany
    {
        return $this->hasMany(AvailabilitySchedule::class);
    }

    public function preferredSports(): BelongsToMany
    {
        return $this->sports()->wherePivot('is_preferred', true);
    }

    // Verification relationships
    public function verificationRequests(): HasMany
    {
        return $this->hasMany(PhotoVerificationRequest::class);
    }

    public function latestVerificationRequest(): HasOne
    {
        return $this->hasOne(PhotoVerificationRequest::class)->latest();
    }

    /**
     * Check if user has complete profile (including at least one photo)
     */
    public function getHasCompleteProfileAttribute(): bool
    {
        // Check if profile exists and is complete
        if (!$this->profile || !$this->profile->is_complete) {
            return false;
        }

        // Check if user has at least one sport
        if ($this->sports()->count() === 0) {
            return false;
        }

        // IMPORTANT: Check if user has at least one photo
        if ($this->profile->photos()->count() === 0) {
            return false;
        }

        return true;
    }

    public function getAgeAttribute(): ?int
    {
        return $this->profile?->age;
    }

    public function getAvailabilityForDay(string $day): ?AvailabilitySchedule
    {
        return $this->availabilitySchedules()
            ->where('day_of_week', $day)
            ->first();
    }

    public function isAvailableAt(string $day, string $time): bool
    {
        $schedule = $this->getAvailabilityForDay($day);

        if (!$schedule) {
            return false;
        }

        return $time >= $schedule->start_time && $time <= $schedule->end_time;
    }

    public function getWeeklyAvailability(): array
    {
        $schedules = $this->availabilitySchedules()
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')")
            ->get();

        $weekly = [];
        foreach ($schedules as $schedule) {
            $weekly[$schedule->day_of_week] = [
                'start' => $schedule->start_time,
                'end' => $schedule->end_time,
                'label' => $schedule->day_label . ': ' . $schedule->time_range
            ];
        }

        return $weekly;
    }

    public function sentFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id');
    }

    public function receivedFriendships(): HasMany
    {
        return $this->hasMany(Friendship::class, 'receiver_id');
    }

    public function friendsAsSender()
    {
        return $this->belongsToMany(
            User::class,
            'friendships',
            'sender_id',
            'receiver_id'
        )
            ->wherePivot('status', 'accepted')
            ->withTimestamps();
    }

    public function friendsAsReceiver()
    {
        return $this->belongsToMany(
            User::class,
            'friendships',
            'receiver_id',
            'sender_id'
        )
            ->wherePivot('status', 'accepted')
            ->withTimestamps();
    }

    public function friends()
    {
        $senderFriendIds = $this->friendsAsSender()->pluck('users.id');
        $receiverFriendIds = $this->friendsAsReceiver()->pluck('users.id');
        $allFriendIds = $senderFriendIds->merge($receiverFriendIds)->unique();

        return User::whereIn('id', $allFriendIds);
    }

    public function isFriendWith(User $user): bool
    {
        return Friendship::where(function($q) use ($user) {
            $q->where('sender_id', $this->id)
                ->where('receiver_id', $user->id);
        })->orWhere(function($q) use ($user) {
            $q->where('sender_id', $user->id)
                ->where('receiver_id', $this->id);
        })->where('status', 'accepted')
            ->exists();
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function sendFriendRequest(User $user): Friendship
    {
        return Friendship::create([
            'sender_id' => $this->id,
            'receiver_id' => $user->id,
            'status' => 'pending',
        ]);
    }

    public function acceptFriendRequest(User $user): bool
    {
        $friendship = Friendship::where('sender_id', $user->id)
            ->where('receiver_id', $this->id)
            ->where('status', 'pending')
            ->first();

        if ($friendship) {
            $friendship->update([
                'status' => 'accepted',
                'accepted_at' => now(),
            ]);
            return true;
        }

        return false;
    }

    public function sendMessage(User $receiver, string $message): Message
    {
        return Message::create([
            'sender_id' => $this->id,
            'receiver_id' => $receiver->id,
            'message' => $message,
        ]);
    }

    public function getConversationWith(User $user)
    {
        return Message::betweenUsers($this->id, $user->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function getUnreadMessagesCount(): int
    {
        return $this->receivedMessages()->unread()->count();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function getUnreadNotificationsCountAttribute(): int
    {
        return $this->notifications()->unread()->count();
    }

    public function getRecentNotifications(int $limit = 10)
    {
        return $this->notifications()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if user is verified
     */
    public function isVerified(): bool
    {
        return $this->profile?->is_verified ?? false;
    }

    /**
     * Get verification status
     */
    public function getVerificationStatus(): string
    {
        return $this->profile?->verification_status ?? 'unverified';
    }

    /**
     * Check if user can start verification
     */
    public function canStartVerification(): bool
    {
        return $this->profile?->canStartNewVerification() ?? false;
    }
}
