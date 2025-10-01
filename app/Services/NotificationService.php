<?php

namespace App\Services;

use App\Models\GroupEvent;
use App\Models\GroupEventFeedback;
use App\Models\Notification;
use App\Models\User;
use App\Events\NotificationSent;


class NotificationService
{
    /**
     * Create a friend request notification
     */
    public static function friendRequest(User $sender, User $receiver): void
    {
        $notification = Notification::create([
            'user_id' => $receiver->id,
            'type' => 'friend_request',
            'data' => [
                'sender_id' => $sender->id,
                'sender_name' => $sender->name . ' ' . ($sender->lastname ?? ''),
                'sender_photo' => $sender->profile?->main_photo
            ]
        ]);

        broadcast(new NotificationSent($notification, $receiver))->toOthers();
    }

    /**
     * Create a friend request accepted notification
     */
    public static function friendRequestAccepted(User $accepter, User $requester): void
    {
        $notification = Notification::create([
            'user_id' => $requester->id,
            'type' => 'friend_request_accepted',
            'data' => [
                'friend_id' => $accepter->id,
                'friend_name' => $accepter->name . ' ' . ($accepter->lastname ?? ''),
                'friend_photo' => $accepter->profile?->main_photo
            ]
        ]);

        broadcast(new NotificationSent($notification, $requester))->toOthers();
    }

    /**
     * Create a new message notification
     */
    public static function newMessage(User $sender, User $receiver, string $messagePreview): void
    {
        $notification = Notification::create([
            'user_id' => $receiver->id,
            'type' => 'new_message',
            'data' => [
                'sender_id' => $sender->id,
                'sender_name' => $sender->name . ' ' . ($sender->lastname ?? ''),
                'sender_photo' => $sender->profile?->main_photo,
                'message_preview' => \Str::limit($messagePreview, 50)
            ]
        ]);

        broadcast(new NotificationSent($notification, $receiver))->toOthers();
    }

    /**
     * Create a group comment notification
     */
    public static function groupPostComment($comment, $post, $group): void
    {
        // Don't notify if commenting on own post
        if ($comment->user_id === $post->user_id) {
            return;
        }

        $notification = Notification::create([
            'user_id' => $post->user_id,
            'type' => 'group_post_comment',
            'data' => [
                'commenter_id' => $comment->user_id,
                'commenter_name' => $comment->user->name . ' ' . ($comment->user->lastname ?? ''),
                'commenter_photo' => $comment->user->profile?->main_photo,
                'group_id' => $group->id,
                'group_name' => $group->name,
                'post_id' => $post->id,
                'comment_preview' => \Str::limit($comment->content, 50)
            ]
        ]);

        broadcast(new NotificationSent($notification, $post->user))->toOthers();
    }

    /**
     * Create a group event notification
     */
    public static function groupEventCreated($event, $group, $excludeUserId = null): void
    {
        // Notify all group members except the creator
        $members = $group->approvedMembers()
            ->where('users.id', '!=', $excludeUserId)
            ->get();

        foreach ($members as $member) {
            $notification = Notification::create([
                'user_id' => $member->id,
                'type' => 'group_event_created',
                'data' => [
                    'group_id' => $group->id,
                    'group_name' => $group->name,
                    'event_id' => $event->id,
                    'event_title' => $event->title,
                    'event_date' => $event->event_date->format('d.m.Y H:i'),
                    'event_location' => $event->location,
                    'creator_name' => $event->creator->name . ' ' . ($event->creator->lastname ?? '')
                ]
            ]);

            broadcast(new NotificationSent($notification, $member))->toOthers();
        }
    }

    /**
     * Create a group invitation notification
     */
    public static function groupInvitation($invitation, $group, $inviter, $invitee): void
    {
        $notification = Notification::create([
            'user_id' => $invitee->id,
            'type' => 'group_invitation',
            'data' => [
                'group_id' => $group->id,
                'group_name' => $group->name,
                'inviter_id' => $inviter->id,
                'inviter_name' => $inviter->name . ' ' . ($inviter->lastname ?? ''),
                'inviter_photo' => $inviter->profile?->main_photo,
                'invitation_id' => $invitation->id
            ]
        ]);

        broadcast(new NotificationSent($notification, $invitee))->toOthers();
    }
    public static function verificationApproved(User $user): void
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'verification_approved',
            'data' => [
                'message' => 'Tavs profils ir veiksmīgi verificēts!',
                'verified_at' => now()->toIso8601String()
            ]
        ]);

        broadcast(new NotificationSent($notification, $user))->toOthers();
    }

    /**
     * Create verification rejected notification
     */
    public static function verificationRejected(User $user, string $reason): void
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'verification_rejected',
            'data' => [
                'message' => 'Tava verifikācija ir noraidīta',
                'reason' => $reason,
                'rejected_at' => now()->toIso8601String()
            ]
        ]);

        broadcast(new NotificationSent($notification, $user))->toOthers();
    }

    public static function eventFeedbackReceived(GroupEvent $event, GroupEventFeedback $feedback): void
    {
        $notification = Notification::create([
            'user_id' => $event->creator_id,
            'type' => 'event_feedback_received',
            'data' => [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'group_id' => $event->group_id,
                'rating' => $feedback->rating,
                'user_name' => $feedback->user->name . ' ' . $feedback->user->lastname,
                'has_comment' => !empty($feedback->comment)
            ]
        ]);

        broadcast(new NotificationSent($notification, $event->creator))->toOthers();
    }

    public static function eventFeedbackReminder(GroupEvent $event, User $user): void
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'event_feedback_reminder',
            'data' => [
                'event_id' => $event->id,
                'event_title' => $event->title,
                'group_id' => $event->group_id,
                'group_name' => $event->group->name
            ]
        ]);

        broadcast(new NotificationSent($notification, $user))->toOthers();
    }
}
