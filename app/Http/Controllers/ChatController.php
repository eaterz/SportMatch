<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\UserProfilePhoto;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class ChatController extends Controller
{

    public function index(User $friend = null)
    {
        $user = Auth::user();

        // Get all friends (from both sender and receiver relationships)
        $friendsAsSender = User::join('friendships', 'users.id', '=', 'friendships.receiver_id')
            ->where('friendships.sender_id', $user->id)
            ->where('friendships.status', 'accepted')
            ->select('users.*')
            ->with(['profile'])
            ->get();

        $friendsAsReceiver = User::join('friendships', 'users.id', '=', 'friendships.sender_id')
            ->where('friendships.receiver_id', $user->id)
            ->where('friendships.status', 'accepted')
            ->select('users.*')
            ->with(['profile'])
            ->get();

        $allFriends = $friendsAsSender->merge($friendsAsReceiver)->unique('id');

        $friends = $allFriends->map(function($friend) use ($user) {
            // Get main photo
            if ($friend->profile) {
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $friend->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $friend->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }
            }

            // Get last message
            $lastMessage = Message::betweenUsers($user->id, $friend->id)
                ->latest()
                ->first();

            // Get unread count
            $unreadCount = Message::where('sender_id', $friend->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();

            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'lastname' => $friend->lastname,
                'profile' => $friend->profile,
                'last_message' => $lastMessage ? [
                    'message' => $lastMessage->message,
                    'created_at' => $lastMessage->created_at,
                    'is_sender' => $lastMessage->sender_id === $user->id
                ] : null,
                'unread_count' => $unreadCount,
                'is_online' => false // You can implement this with Pusher presence channels
            ];
        })
            ->sortByDesc(function($friend) {
                return $friend['last_message'] ? $friend['last_message']['created_at'] : null;
            })
            ->values();

        $messages = [];
        $selectedFriend = null;

        // If a friend is selected, load their conversation
        if ($friend && $user->isFriendWith($friend)) {
            // Mark messages as read
            Message::where('sender_id', $friend->id)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            // Get conversation messages
            $messages = Message::betweenUsers($user->id, $friend->id)
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function($message) use ($user) {
                    return [
                        'id' => $message->id,
                        'message' => $message->message,
                        'created_at' => $message->created_at->format('H:i'),
                        'date' => $message->created_at->format('Y-m-d'),
                        'is_sender' => $message->sender_id === $user->id,
                        'is_read' => !is_null($message->read_at)
                    ];
                });

            // Get friend's main photo
            if ($friend->profile) {
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $friend->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $friend->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }
            }

            $selectedFriend = [
                'id' => $friend->id,
                'name' => $friend->name,
                'lastname' => $friend->lastname,
                'profile' => $friend->profile
            ];
        }

        return Inertia::render('Chat', [
            'user' => $user,
            'friends' => $friends,
            'messages' => $messages,
            'selectedFriend' => $selectedFriend,
            'pusherKey' => config('broadcasting.connections.pusher.key'),
            'pusherCluster' => config('broadcasting.connections.pusher.options.cluster'),
        ]);
    }


    public function sendMessage(Request $request, User $friend)
    {
        try {
            $request->validate([
                'message' => 'required|string|max:1000'
            ]);

            $message = Message::create([
                'sender_id' => auth()->id(),
                'receiver_id' => $friend->id,
                'message' => $request->message,
            ]);

            broadcast(new MessageSent(
                $message,
                auth()->id(),
                $friend->id
            ));


            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'created_at' => $message->created_at->format('H:i'),
                    'date' => $message->created_at->format('Y-m-d'),
                    'is_sender' => true,
                    'is_read' => false
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('SendMessage error', ['exception' => $e]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }



    public function markAsRead(Request $request, User $sender)
    {
        $user = Auth::user();

        Message::where('sender_id', $sender->id)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }


    public function getMessages(User $friend)
    {
        $user = Auth::user();

        if (!$user->isFriendWith($friend)) {
            return response()->json(['error' => 'Not authorized'], 403);
        }

        $messages = Message::betweenUsers($user->id, $friend->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($message) use ($user) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'created_at' => $message->created_at->format('H:i'),
                    'date' => $message->created_at->format('Y-m-d'),
                    'is_sender' => $message->sender_id === $user->id,
                    'is_read' => !is_null($message->read_at)
                ];
            });

        return response()->json($messages);
    }
}
