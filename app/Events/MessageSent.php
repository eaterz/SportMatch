<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $senderId;
    public $receiverId;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, $senderId, $receiverId)
    {
        $this->message = [
            'id' => $message->id,
            'message' => $message->message,
            'created_at' => $message->created_at->format('H:i'),
            'date' => $message->created_at->format('Y-m-d'),
        ];
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Broadcast to both users' private channels
        return [
            new PrivateChannel('chat.' . $this->senderId),
            new PrivateChannel('chat.' . $this->receiverId)
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'message.sent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'sender_id' => $this->senderId,
            'receiver_id' => $this->receiverId
        ];
    }
}
