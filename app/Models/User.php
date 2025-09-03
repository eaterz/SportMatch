<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
}
