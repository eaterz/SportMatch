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
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    protected $appends = ['age', 'main_photo'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Photos relationship - all photos
    public function photos(): HasMany
    {
        return $this->hasMany(UserProfilePhoto::class, 'user_profile_id', 'id');
    }

    // Get main photo only
    public function mainPhoto()
    {
        return $this->hasOne(UserProfilePhoto::class)->where('is_main', true);
    }

    // Get main photo URL attribute
    public function getMainPhotoAttribute()
    {
        $photo = $this->photos()->where('is_main', true)->first();
        return $photo ? asset('storage/' . $photo->photo_path) : null;
    }

    // Get all photo URLs
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

    // Calculate age
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date
            ? Carbon::parse($this->birth_date)->age
            : null;
    }

    // Check if profile is complete
    public function getIsCompleteAttribute(): bool
    {
        return !is_null($this->birth_date)
            && !is_null($this->gender)
            && !is_null($this->location);
    }
    public function setPhoneAttribute($value)
    {
        if ($value) {
            $digits = preg_replace('/\D/', '', $value); // keep only numbers
            $digits = preg_replace('/^371/', '', $digits); // remove leading 371 if exists
            $this->attributes['phone'] = '+371' . $digits;
        } else {
            $this->attributes['phone'] = null;
        }
    }
}
