<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfilePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_profile_id',
        'photo_path',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    public function userProfile(): BelongsTo
    {
        return $this->belongsTo(UserProfile::class);
    }

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute()
    {
        return asset('storage/' . $this->photo_path);
    }
}
