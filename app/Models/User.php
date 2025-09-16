<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Friendship;
use App\Models\Message;
use Illuminate\Support\Facades\DB;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'lastname',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
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

    // Iegūst lietotāja galvenos sportus
    public function preferredSports(): BelongsToMany
    {
        return $this->sports()->wherePivot('is_preferred', true);
    }

    // Pārbauda vai profils ir pabeigts
    public function getHasCompleteProfileAttribute(): bool
    {
        return $this->profile &&
            $this->profile->is_complete &&
            $this->sports()->count() > 0;
    }

    // Iegūst vecumu
    public function getAgeAttribute(): ?int
    {
        return $this->profile?->age;
    }



// Iegūst pieejamību konkrētai dienai
    public function getAvailabilityForDay(string $day): ?AvailabilitySchedule
    {
        return $this->availabilitySchedules()
            ->where('day_of_week', $day)
            ->first();
    }

// Pārbauda vai ir pieejams konkrētā laikā
    public function isAvailableAt(string $day, string $time): bool
    {
        $schedule = $this->getAvailabilityForDay($day);

        if (!$schedule) {
            return false;
        }

        return $time >= $schedule->start_time && $time <= $schedule->end_time;
    }

// Iegūst visas nedēļas pieejamību
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
        // Get IDs of all friends
        $senderFriendIds = $this->friendsAsSender()->pluck('users.id');
        $receiverFriendIds = $this->friendsAsReceiver()->pluck('users.id');
        $allFriendIds = $senderFriendIds->merge($receiverFriendIds)->unique();

        // Return User models for all friends
        return User::whereIn('id', $allFriendIds);
    }

// Helper method to check if user is friend with another user
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


// Message relationships
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

// Helper methods
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
}
