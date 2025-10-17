<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GroupEventDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $eventTitle;
    public $groupId;
    public $participantIds;

    public function __construct($eventId, $eventTitle, $groupId, $participantIds)
    {
        $this->eventId = $eventId;
        $this->eventTitle = $eventTitle;
        $this->groupId = $groupId;
        $this->participantIds = $participantIds;
    }

    public function broadcastOn()
    {
        // Broadcast to each participant's private channel
        $channels = [];
        foreach ($this->participantIds as $participantId) {
            $channels[] = new Channel('notifications.' . $participantId);
        }
        return $channels;
    }

    public function broadcastAs()
    {
        return 'event.deleted';
    }

    public function broadcastWith()
    {
        return [
            'event_id' => $this->eventId,
            'event_title' => $this->eventTitle,
            'group_id' => $this->groupId,
            'message' => "Pasākums '{$this->eventTitle}' tika dzēsts"
        ];
    }
}
