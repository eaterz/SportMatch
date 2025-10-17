<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $groupId;
    public $groupName;
    public $memberIds;

    public function __construct($groupId, $groupName, $memberIds)
    {
        $this->groupId = $groupId;
        $this->groupName = $groupName;
        $this->memberIds = $memberIds;
    }

    public function broadcastOn()
    {
        // Broadcast to each member's private channel
        $channels = [];
        foreach ($this->memberIds as $memberId) {
            $channels[] = new Channel('notifications.' . $memberId);
        }
        return $channels;
    }

    public function broadcastAs()
    {
        return 'group.deleted';
    }

    public function broadcastWith()
    {
        return [
            'group_id' => $this->groupId,
            'group_name' => $this->groupName,
            'message' => "Grupa '{$this->groupName}' tika dzēsta"
        ];
    }
}
