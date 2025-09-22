<?php

namespace App\Events;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $user;

    public function __construct(Notification $notification, User $user)
    {
        $this->notification = [
            'id' => $notification->id,
            'type' => $notification->type,
            'data' => $notification->data,
            'message' => $notification->getMessage(),
            'icon' => $notification->getIcon(),
            'action_url' => $notification->getActionUrl(),
            'created_at' => $notification->created_at->diffForHumans(),
            'is_read' => $notification->isRead()
        ];
        $this->user = $user;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('notifications.' . $this->user->id);
    }

    public function broadcastAs()
    {
        return 'notification.sent';
    }
}
