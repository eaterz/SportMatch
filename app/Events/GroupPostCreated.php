<?php

namespace App\Events;

use App\Models\GroupPost;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupPostCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;

    public function __construct(GroupPost $post)
    {
        $this->post = $post->load('user.profile');
    }

    public function broadcastOn()
    {
        return new Channel('group.' . $this->post->group_id);
    }

    public function broadcastAs()
    {
        return 'post.created';
    }
}
