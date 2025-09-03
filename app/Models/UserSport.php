<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sport_id',
        'skill_level',
        'is_preferred',
    ];

    protected $casts = [
        'is_preferred' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class);
    }

    // Prasmes līmeņa tulkojums
    public function getSkillLevelLabelAttribute(): string
    {
        return match($this->skill_level) {
            'beginner' => 'Iesācējs',
            'intermediate' => 'Vidējais',
            'advanced' => 'Pieredzējis',
            default => 'Nav norādīts'
        };
    }
}
