<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupEventFeedback extends Model
{
    use HasFactory;

    protected $table = 'group_event_feedback';

    protected $fillable = [
        'event_id',
        'user_id',
        'rating',
        'comment',
        'would_recommend',
        'organization_rating',
        'location_rating',
        'value_rating'
    ];

    protected $casts = [
        'would_recommend' => 'boolean',
        'rating' => 'integer'
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(GroupEvent::class, 'event_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get rating label
    public function getRatingLabel(): string
    {
        return match($this->rating) {
            1 => 'Ļoti slikti',
            2 => 'Slikti',
            3 => 'Vidēji',
            4 => 'Labi',
            5 => 'Izcili',
            default => 'Nav vērtējuma'
        };
    }

    // Get category rating label
    public function getCategoryRatingLabel(string $category): string
    {
        $rating = $this->{$category . '_rating'};

        return match($rating) {
            'poor' => 'Slikti',
            'fair' => 'Vidēji',
            'good' => 'Labi',
            'excellent' => 'Izcili',
            default => 'Nav vērtējuma'
        };
    }
}
