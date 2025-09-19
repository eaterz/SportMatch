<?php

namespace App\Events;

use App\Models\GroupPostComment;
use App\Models\Group;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupCommentAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $comment;
    public $group;

    public function __construct(GroupPostComment $comment, Group $group)
    {
        $this->comment = $comment->load('user.profile');
        $this->group = $group;
    }

    public function broadcastOn()
    {
        return new Channel('group.' . $this->group->id);
    }

    public function broadcastAs()
    {
        return 'comment.added';
    }
}
