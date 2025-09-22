<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupPostComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'user_id',
        'content'
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(GroupPost::class, 'post_id');
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
