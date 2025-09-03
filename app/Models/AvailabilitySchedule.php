<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AvailabilitySchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Nedēļas dienas tulkojums
    public function getDayLabelAttribute(): string
    {
        return match($this->day_of_week) {
            'monday' => 'Pirmdiena',
            'tuesday' => 'Otrdiena',
            'wednesday' => 'Trešdiena',
            'thursday' => 'Ceturtdiena',
            'friday' => 'Piektdiena',
            'saturday' => 'Sestdiena',
            'sunday' => 'Svētdiena',
            default => 'Nav norādīts'
        };
    }

    // Laika formāts
    public function getTimeRangeAttribute(): string
    {
        return $this->start_time->format('H:i') . ' - ' . $this->end_time->format('H:i');
    }
}

