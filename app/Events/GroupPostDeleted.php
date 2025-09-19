<?php
// app/Events/GroupPostDeleted.php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupPostDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $postId;
    public $groupId;

    public function __construct($postId, $groupId)
    {
        $this->postId = $postId;
        $this->groupId = $groupId;
    }

    public function broadcastOn()
    {
        return new Channel('group.' . $this->groupId);
    }

    public function broadcastAs()
    {
        return 'post.deleted';
    }

    public function broadcastWith()
    {
        return [
            'post_id' => $this->postId
        ];
    }
}
