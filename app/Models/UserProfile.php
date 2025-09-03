<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'birth_year',
        'phone',
        'gender',
        'bio',
        'location',
    ];

    protected $casts = [
        'birth_year' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Aprēķina vecumu
    public function getAgeAttribute(): int
    {
        return now()->year - $this->birth_year;
    }

    // Pārbauda vai profils ir pabeigts
    public function getIsCompleteAttribute(): bool
    {
        return !is_null($this->birth_year)
            && !is_null($this->gender)
            && !is_null($this->location);
    }
}
