<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class GroupDeleted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $groupId,
        public string $groupName,
        public string $deletedBy
    ) {}

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray($notifiable): array
    {
        return [
            'group_id' => $this->groupId,
            'group_name' => $this->groupName,
            'deleted_by' => $this->deletedBy,
            'message' => "Grupa \"{$this->groupName}\" tika dzēsta",
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'group_id' => $this->groupId,
            'group_name' => $this->groupName,
            'deleted_by' => $this->deletedBy,
            'message' => "Grupa \"{$this->groupName}\" tika dzēsta",
        ]);
    }

    public function broadcastType(): string
    {
        return 'group.deleted';
    }

    public function databaseType(object $notifiable): string
    {
        return 'group_deleted';
    }
}
