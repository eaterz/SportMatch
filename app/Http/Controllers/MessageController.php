<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{

    public function index()
    {
        $user = Auth::user();


        $conversations = $user->friends()
            ->with(['profile'])
            ->get()
            ->map(function($friend) use ($user) {
                $lastMessage = Message::betweenUsers($user->id, $friend->id)
                    ->latest()
                    ->first();

                $unreadCount = $user->receivedMessages()
                    ->where('sender_id', $friend->id)
                    ->unread()
                    ->count();

                return [
                    'user' => $friend,
                    'last_message' => $lastMessage,
                    'unread_count' => $unreadCount
                ];
            })
            ->filter(function($conversation) {
                return $conversation['last_message'] !== null;
            })
            ->sortByDesc(function($conversation) {
                return $conversation['last_message']->created_at;
            })
            ->values();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'user' => $user
        ]);
    }


    public function conversation(User $otherUser)
    {
        $user = Auth::user();


        if (!$user->isFriendWith($otherUser)) {
            return redirect()->route('messages.index')
                ->with('error', 'Jūs varat sūtīt ziņas tikai draugiem');
        }


        $messages = $user->getConversationWith($otherUser)
            ->load(['sender', 'receiver']);


        Message::where('sender_id', $otherUser->id)
            ->where('receiver_id', $user->id)
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        return Inertia::render('Messages/Conversation', [
            'otherUser' => $otherUser->load(['profile', 'sports.sport']),
            'messages' => $messages,
            'user' => $user
        ]);
    }

    public function chat(User $otherUser = null)
    {
        $user = Auth::user();

        $friends = $user->friends()
            ->with(['profile'])
            ->get()
            ->map(function($friend) use ($user) {
                $lastMessage = Message::betweenUsers($user->id, $friend->id)
                    ->latest()
                    ->first();

                $unreadCount = $user->receivedMessages()
                    ->where('sender_id', $friend->id)
                    ->unread()
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
                    'is_online' => false // You can implement online status later
                ];
            });

        $messages = null;
        $selectedUser = null;

        if ($otherUser && $user->isFriendWith($otherUser)) {

            $messages = $user->getConversationWith($otherUser)
                ->map(function($message) use ($user) {
                    return [
                        'id' => $message->id,
                        'message' => $message->message,
                        'created_at' => $message->created_at,
                        'is_sender' => $message->sender_id === $user->id,
                        'is_read' => $message->is_read,
                        'read_at' => $message->read_at
                    ];
                });


            Message::where('sender_id', $otherUser->id)
                ->where('receiver_id', $user->id)
                ->unread()
                ->update(['is_read' => true, 'read_at' => now()]);

            $selectedUser = [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'lastname' => $otherUser->lastname,
                'profile' => $otherUser->profile
            ];
        }

        return Inertia::render('Chat', [
            'friends' => $friends,
            'messages' => $messages,
            'selectedUser' => $selectedUser,
            'user' => $user
        ]);
    }


    public function send(Request $request, User $receiver)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $user = Auth::user();


        if (!$user->isFriendWith($receiver)) {
            return back()->with('error', 'Jūs varat sūtīt ziņas tikai draugiem');
        }


        $message = $user->sendMessage($receiver, $request->message);


        if ($request->wantsJson()) {
            return response()->json([
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'created_at' => $message->created_at,
                    'is_sender' => true
                ]
            ]);
        }

        return back();
    }


    public function markAsRead(Request $request, User $sender)
    {
        $user = Auth::user();

        Message::where('sender_id', $sender->id)
            ->where('receiver_id', $user->id)
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    public function delete(Message $message)
    {
        $user = Auth::user();


        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            return back()->with('error', 'Nav atļauts dzēst šo ziņu');
        }

        $message->delete();

        return back()->with('success', 'Ziņa dzēsta');
    }

    public function unreadCount(Request $request)
    {
        $user = Auth::user();
        $count = $user->getUnreadMessagesCount();

        return response()->json(['count' => $count]);
    }


    public function friendsJson(Request $request)
    {
        $user = Auth::user();

        $friends = $user->friends()
            ->with(['profile'])
            ->get()
            ->map(function($friend) use ($user) {
                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'lastname' => $friend->lastname,
                    'profile' => $friend->profile,
                    'unread_count' => $user->receivedMessages()
                        ->where('sender_id', $friend->id)
                        ->unread()
                        ->count()
                ];
            });

        return response()->json($friends);
    }
}
