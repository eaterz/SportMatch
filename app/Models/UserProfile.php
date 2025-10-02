<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'birth_date',
        'phone',
        'gender',
        'bio',
        'location',
        'city_id',
        'is_verified',
        'verified_at',
        'verification_method'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime'
    ];

    protected $appends = ['age', 'main_photo', 'verification_status', 'verification_submitted_at', 'verification_rejected_reason'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(UserProfilePhoto::class, 'user_profile_id', 'id');
    }

    public function mainPhoto()
    {
        return $this->hasOne(UserProfilePhoto::class)->where('is_main', true);
    }

    public function getMainPhotoAttribute()
    {
        $photo = $this->photos()->where('is_main', true)->first();
        return $photo ? asset('storage/' . $photo->photo_path) : null;
    }

    public function getPhotoUrlsAttribute()
    {
        return $this->photos->map(function($photo) {
            return [
                'id' => $photo->id,
                'url' => $photo->photo_url,
                'is_main' => $photo->is_main
            ];
        });
    }

    public function getAgeAttribute(): ?int
    {
        return $this->birth_date
            ? Carbon::parse($this->birth_date)->age
            : null;
    }

    public function getIsCompleteAttribute(): bool
    {
        return !is_null($this->birth_date)
            && !is_null($this->gender)
            && !is_null($this->city_id);
    }

    public function setPhoneAttribute($value)
    {
        if ($value) {
            $digits = preg_replace('/\D/', '', $value);
            $digits = preg_replace('/^371/', '', $digits);
            $this->attributes['phone'] = '+371' . $digits;
        } else {
            $this->attributes['phone'] = null;
        }
    }

    public function photoVerificationRequests()
    {
        return $this->hasMany(PhotoVerificationRequest::class, 'user_id', 'user_id');
    }

    public function latestVerificationRequest()
    {
        return $this->hasOne(PhotoVerificationRequest::class, 'user_id', 'user_id')
            ->latest();
    }

    public function getVerificationStatusAttribute(): string
    {
        if ($this->is_verified) {
            return 'verified';
        }

        $latestRequest = $this->photoVerificationRequests()
            ->latest()
            ->first();

        if (!$latestRequest) {
            return 'unverified';
        }

        if ($latestRequest->status === 'pending' && !$latestRequest->isExpired()) {
            return 'pending';
        }

        if ($latestRequest->status === 'rejected') {
            return 'rejected';
        }

        return 'unverified';
    }

    public function getVerificationSubmittedAtAttribute(): ?string
    {
        $latestRequest = $this->photoVerificationRequests()
            ->where('status', 'pending')
            ->latest()
            ->first();

        return $latestRequest ? $latestRequest->created_at->diffForHumans() : null;
    }

    public function getVerificationRejectedReasonAttribute(): ?string
    {
        $latestRequest = $this->photoVerificationRequests()
            ->where('status', 'rejected')
            ->latest()
            ->first();

        return $latestRequest?->rejection_reason;
    }

    public function canStartNewVerification(): bool
    {
        if ($this->is_verified) {
            return false;
        }

        $pendingRequest = $this->photoVerificationRequests()
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        return !$pendingRequest;
    }

    public function getVerificationBadgeAttribute(): array
    {
        return [
            'verified' => $this->is_verified,
            'verified_at' => $this->verified_at?->format('d.m.Y'),
            'method' => $this->verification_method
        ];
    }

    /**
     * Calculate distance to another user's city
     */

    public function distanceTo(UserProfile $otherProfile): ?float
    {
        if (!$this->city || !$otherProfile->city) {
            return null;
        }

        return $this->city->distanceTo($otherProfile->city);
    }
}
