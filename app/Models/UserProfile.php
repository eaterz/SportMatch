<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'birth_date', // updated
        'phone',
        'gender',
        'bio',
        'location',
    ];

    protected $casts = [
        'birth_date' => 'date', // cast as Carbon date instance
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Aprēķina vecumu
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date
            ? Carbon::parse($this->birth_date)->age
            : null;
    }

    // Pārbauda vai profils ir pabeigts
    public function getIsCompleteAttribute(): bool
    {
        return !is_null($this->birth_date)
            && !is_null($this->gender)
            && !is_null($this->location);
    }
}
