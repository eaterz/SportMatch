<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\UserProfilePhoto;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class FriendsController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        // Get accepted friends
        $friends = collect();
        $friendships = Friendship::where(function($q) use ($user) {
            $q->where('sender_id', $user->id)
                ->where('status', 'accepted');
        })->orWhere(function($q) use ($user) {
            $q->where('receiver_id', $user->id)
                ->where('status', 'accepted');
        })->get();

        foreach ($friendships as $friendship) {
            $friendId = $friendship->sender_id == $user->id
                ? $friendship->receiver_id
                : $friendship->sender_id;

            $friend = User::with(['profile', 'sports'])->find($friendId);

            // Only add friend if they exist and have a profile
            if ($friend && $friend->profile) {
                // Get main photo
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $friend->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $friend->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }

                $friends->push($friend); // Only push if friend exists
            }
        }

        // Get pending requests received
        $pendingReceived = Friendship::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender.profile', 'sender.sports')
            ->get()
            ->map(function($friendship) {
                $sender = $friendship->sender;

                // Check if sender exists and has profile
                if (!$sender || !$sender->profile) {
                    return null;
                }

                $mainPhoto = UserProfilePhoto::where('user_profile_id', $sender->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $sender->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }

                return $sender;
            })
            ->filter(function($sender) {
                return $sender !== null; // Filter out null values
            })
            ->values(); // Re-index the collection

        // Get pending requests sent
        $pendingSent = Friendship::where('sender_id', $user->id)
            ->where('status', 'pending')
            ->with('receiver.profile', 'receiver.sports')
            ->get()
            ->map(function($friendship) {
                $receiver = $friendship->receiver;

                // Check if receiver exists and has profile
                if (!$receiver || !$receiver->profile) {
                    return null;
                }

                $mainPhoto = UserProfilePhoto::where('user_profile_id', $receiver->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $receiver->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }

                return $receiver;
            })
            ->filter(function($receiver) {
                return $receiver !== null; // Filter out null values
            })
            ->values(); // Re-index the collection

        return Inertia::render('Friends', [
            'user' => $user,
            'friends' => $friends,
            'pendingReceived' => $pendingReceived,
            'pendingSent' => $pendingSent
        ]);
    }


    public function acceptRequest($senderId)
    {
        $user = Auth::user();

        $friendship = Friendship::where('sender_id', $senderId)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($friendship) {
            $friendship->update([
                'status' => 'accepted',
                'accepted_at' => now()
            ]);

            NotificationService::friendRequestAccepted($user, User::find($senderId));

            return back()->with('success', 'Draudzības pieprasījums pieņemts!');
        }

        return back()->with('error', 'Pieprasījums nav atrasts');
    }


    public function rejectRequest($senderId)
    {
        $user = Auth::user();

        $friendship = Friendship::where('sender_id', $senderId)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($friendship) {
            $friendship->delete();
            return back()->with('success', 'Draudzības pieprasījums noraidīts');
        }

        return back()->with('error', 'Pieprasījums nav atrasts');
    }

    public function cancelRequest($receiverId)
    {
        $user = Auth::user();

        $friendship = Friendship::where('sender_id', $user->id)
            ->where('receiver_id', $receiverId)
            ->where('status', 'pending')
            ->first();

        if ($friendship) {
            $friendship->delete();
            return back()->with('success', 'Draudzības pieprasījums atcelts');
        }

        return back()->with('error', 'Pieprasījums nav atrasts');
    }


    public function removeFriend($friendId)
    {
        $user = Auth::user();

        $friendship = Friendship::where(function($q) use ($user, $friendId) {
            $q->where('sender_id', $user->id)
                ->where('receiver_id', $friendId);
        })->orWhere(function($q) use ($user, $friendId) {
            $q->where('sender_id', $friendId)
                ->where('receiver_id', $user->id);
        })->first();

        if ($friendship) {
            $friendship->delete();
            return back()->with('success', 'Draugs noņemts no saraksta');
        }

        return back()->with('error', 'Draudzība nav atrasta');
    }
}
