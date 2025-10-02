<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }

    public function getMessage(): string
    {
        $data = $this->data;

        switch ($this->type) {
            case 'friend_request':
                return "{$data['sender_name']} vēlas būt tavs draugs";

            case 'friend_request_accepted':
                return "{$data['friend_name']} pieņēma tavu draudzības pieprasījumu";

            case 'new_message':
                return "{$data['sender_name']} nosūtīja tev ziņu";

            case 'group_post_comment':
                return "{$data['commenter_name']} komentēja tavu ierakstu grupā {$data['group_name']}";

            case 'group_event_created':
                return "Jauns pasākums '{$data['event_title']}' grupā {$data['group_name']}";

            case 'group_event_reminder':
                return "Pasākums '{$data['event_title']}' sāksies {$data['time_until']}";

            case 'group_member_joined':
                return "{$data['member_name']} pievienojās grupai {$data['group_name']}";

            case 'group_invitation':
                return "{$data['inviter_name']} uzaicina tevi pievienoties grupai {$data['group_name']}";

            case 'event_feedback_received':
                $message = "{$data['user_name']} atstāja vērtējumu par pasākumu '{$data['event_title']}'";
                return $message;

            case 'verification_approved':
                return "Tavs verifikācijas pieprasījums tika apstiprināts";

            case 'verification_rejected':
                return "Tavs verifikācijas pieprasījums tika noraidīts";

            default:
                return 'Jauns paziņojums';
        }
    }

    public function getIcon(): string
    {
        switch ($this->type) {
            case 'friend_request':
            case 'friend_request_accepted':
                return 'user-plus';

            case 'new_message':
                return 'message-square';

            case 'group_post_comment':
                return 'message-circle';

            case 'group_event_created':
            case 'group_event_reminder':
                return 'calendar';

            case 'group_member_joined':
            case 'group_invitation':
                return 'users';

            case 'event_feedback_received':
                return 'star';

            case 'verification_approved':
            case 'verification_rejected':
                return 'shield-check';

            default:
                return 'bell';
        }
    }

    public function getActionUrl(): ?string
    {
        $data = $this->data;

        switch ($this->type) {
            case 'friend_request':
                return '/friends';

            case 'friend_request_accepted':
                return "/chat/{$data['friend_id']}";

            case 'new_message':
                return "/chat/{$data['sender_id']}";

            case 'group_post_comment':
                return "/groups/{$data['group_id']}#post-{$data['post_id']}";

            case 'group_event_created':
            case 'group_event_reminder':
                return "/groups/{$data['group_id']}/events/{$data['event_id']}";

            case 'group_member_joined':
                return "/groups/{$data['group_id']}/members";

            case 'group_invitation':
                return "/groups/{$data['group_id']}";

            case 'event_feedback_received':
                return "/groups/{$data['group_id']}/events/{$data['event_id']}/feedback";

            case 'verification_approved':
            case 'verification_rejected':
                return "/profile/{$data['user_id']}";

            default:
                return null;
        }
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
