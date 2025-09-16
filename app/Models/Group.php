<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'cover_photo',
        'location',
        'max_members',
        'is_private',
        'is_active'
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'is_active' => 'boolean',
        'max_members' => 'integer'
    ];

    // Izveidotājs
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    // Dalībnieki
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot(['role', 'status', 'joined_at'])
            ->withTimestamps();
    }

    // Apstiprinātie dalībnieki
    public function approvedMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('status', 'approved');
    }

    // Gaidošie dalībnieki
    public function pendingMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('status', 'pending');
    }

    // Administratori
    public function admins(): BelongsToMany
    {
        return $this->members()
            ->wherePivot('role', 'admin')
            ->wherePivot('status', 'approved');
    }

    // Sporta veidi
    public function sports(): BelongsToMany
    {
        return $this->belongsToMany(Sport::class, 'group_sports')
            ->withPivot('skill_level')
            ->withTimestamps();
    }

    // Pasākumi
    public function events(): HasMany
    {
        return $this->hasMany(GroupEvent::class);
    }

    // Nākotnes pasākumi
    public function upcomingEvents(): HasMany
    {
        return $this->events()
            ->where('event_date', '>=', now())
            ->where('status', 'upcoming')
            ->orderBy('event_date');
    }

    // Ziņas/diskusijas
    public function posts(): HasMany
    {
        return $this->hasMany(GroupPost::class);
    }

    // Uzaicinājumi
    public function invitations(): HasMany
    {
        return $this->hasMany(GroupInvitation::class);
    }

    // Pārbauda vai lietotājs ir dalībnieks
    public function isMember(User $user): bool
    {
        return $this->approvedMembers()
            ->where('user_id', $user->id)
            ->exists();
    }

    // Pārbauda vai lietotājs ir administrators
    public function isAdmin(User $user): bool
    {
        return $this->admins()
                ->where('user_id', $user->id)
                ->exists() || $this->creator_id === $user->id;
    }

    // Pārbauda vai grupa ir pilna
    public function isFull(): bool
    {
        if (!$this->max_members) {
            return false;
        }

        return $this->approvedMembers()->count() >= $this->max_members;
    }

    // Pievieno dalībnieku
    public function addMember(User $user, string $status = 'approved'): void
    {
        if (!$this->isMember($user)) {
            $this->members()->attach($user->id, [
                'role' => 'member',
                'status' => $status,
                'joined_at' => $status === 'approved' ? now() : null
            ]);
        }
    }

    // Noņem dalībnieku
    public function removeMember(User $user): void
    {
        $this->members()->detach($user->id);
    }

    // Apstiprina dalībnieku
    public function approveMember(User $user): void
    {
        $this->members()->updateExistingPivot($user->id, [
            'status' => 'approved',
            'joined_at' => now()
        ]);
    }

    // Dalībnieku skaits
    public function getMembersCountAttribute(): int
    {
        return $this->approvedMembers()->count();
    }

    // Piesprauž ziņu
    public function pinPost(GroupPost $post): void
    {
        // Noņem iepriekšējo piesprausto
        $this->posts()->where('is_pinned', true)->update(['is_pinned' => false]);

        // Piesprauž jauno
        $post->update(['is_pinned' => true]);
    }
    protected $appends = ['cover_photo_url'];

    // Grupas galvenā bilde
    public function getCoverPhotoUrlAttribute(): ?string
    {
        return $this->cover_photo
            ? asset('storage/' . $this->cover_photo)
            : null;
    }
}
