<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sport extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_sports')
            ->withPivot('skill_level', 'is_preferred')
            ->withTimestamps();
    }

    // Aktīvo sporta veidu scope
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
