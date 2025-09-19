<?php

namespace App\Events;

use App\Models\GroupPost;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupPostLiked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;
    public $user;

    public function __construct(GroupPost $post, User $user)
    {
        $this->post = $post;
        $this->user = $user;
    }

    public function broadcastOn()
    {
        return new Channel('group.' . $this->post->group_id);
    }

    public function broadcastAs()
    {
        return 'post.liked';
    }

    public function broadcastWith()
    {
        return [
            'post_id' => $this->post->id,
            'likes_count' => $this->post->likes_count,
            'is_liked' => $this->post->isLikedBy($this->user)
        ];
    }
}
