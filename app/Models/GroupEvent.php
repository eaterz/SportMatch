<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\GroupEventFeedback;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GroupEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'creator_id',
        'title',
        'description',
        'city_id',
        'event_date',
        'duration',
        'max_participants',
        'price',
        'is_recurring',
        'recurring_pattern',
        'status'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'is_recurring' => 'boolean',
        'max_participants' => 'integer',
        'price' => 'decimal:2'
    ];

    // Grupa
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    // Izveidotājs
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    // Dalībnieki
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_event_participants', 'event_id')
            ->withPivot(['status', 'responded_at'])
            ->withTimestamps();
    }

    // Apstiprinātie dalībnieki
    public function confirmedParticipants(): BelongsToMany
    {
        return $this->participants()->wherePivot('status', 'going');
    }

    // Pārbauda vai pasākums ir pilns
    public function isFull(): bool
    {
        if (!$this->max_participants) {
            return false;
        }

        return $this->confirmedParticipants()->count() >= $this->max_participants;
    }

    // Pievieno dalībnieku
    public function addParticipant(User $user, string $status = 'going'): void
    {
        $this->participants()->syncWithoutDetaching([
            $user->id => [
                'status' => $status,
                'responded_at' => now()
            ]
        ]);
    }



    // Noņem dalībnieku
    public function removeParticipant(User $user): void
    {
        $this->participants()->detach($user->id);
    }

    // Dalībnieku skaits
    public function getParticipantsCountAttribute(): int
    {
        return $this->confirmedParticipants()->count();
    }

    // Pārbauda vai lietotājs piedalās
    public function isParticipating(User $user): bool
    {
        return $this->confirmedParticipants()
            ->where('user_id', $user->id)
            ->exists();
    }

    // Add this relationship
    public function feedback(): HasMany
    {
        return $this->hasMany(GroupEventFeedback::class, 'event_id');
    }

// Add method to check if user has given feedback
    public function hasUserFeedback(User $user): bool
    {
        return $this->feedback()
            ->where('user_id', $user->id)
            ->exists();
    }

// Get average rating
    public function getAverageRatingAttribute(): ?float
    {
        $avg = $this->feedback()->avg('rating');
        return $avg ? round($avg, 1) : null;
    }

// Get recommendation percentage
    public function getRecommendationPercentageAttribute(): ?int
    {
        $total = $this->feedback()->count();
        if ($total === 0) return null;

        $recommended = $this->feedback()->where('would_recommend', true)->count();
        return round(($recommended / $total) * 100);
    }

// Check if event is eligible for feedback (ended and user participated)
    public function canLeaveFeedback(User $user): bool
    {
        // Event must be past
        if ($this->event_date >= now()) {
            return false;
        }

        // User must have participated
        if (!$this->isParticipating($user)) {
            return false;
        }

        // User hasn't already left feedback
        if ($this->hasUserFeedback($user)) {
            return false;
        }

        return true;
    }

    // Pilsēta
    public function city(): BelongsTo
    {
        return $this->belongsTo(\App\Models\City::class);
    }



}
