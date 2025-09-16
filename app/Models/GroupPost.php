<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GroupPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'user_id',
        'content',
        'image',
        'is_pinned',
        'is_announcement',
        'likes_count',
        'comments_count'
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_announcement' => 'boolean',
        'likes_count' => 'integer',
        'comments_count' => 'integer'
    ];

    // Grupa
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    // Autors
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Komentāri
    public function comments(): HasMany
    {
        return $this->hasMany(GroupPostComment::class, 'post_id');
    }

    // Patīk
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_post_likes', 'post_id')
            ->withTimestamps();
    }

    // Pārbauda vai lietotājam patīk
    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    // Pievieno patīk
    public function addLike(User $user): void
    {
        if (!$this->isLikedBy($user)) {
            $this->likes()->attach($user->id);
            $this->increment('likes_count');
        }
    }

    // Noņem patīk
    public function removeLike(User $user): void
    {
        if ($this->isLikedBy($user)) {
            $this->likes()->detach($user->id);
            $this->decrement('likes_count');
        }
    }

    // Attēla URL
    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}
