<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GroupEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'creator_id',
        'title',
        'description',
        'location',
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
}
