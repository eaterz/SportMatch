<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\UserProfilePhoto;
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

            if ($friend && $friend->profile) {
                // Get main photo
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $friend->profile->id)
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $friend->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }
            }

            $friends->push($friend);
        }

        // Get pending requests received
        $pendingReceived = Friendship::where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->with('sender.profile', 'sender.sports')
            ->get()
            ->map(function($friendship) {
                $sender = $friendship->sender;

                if ($sender->profile) {
                    $mainPhoto = UserProfilePhoto::where('user_profile_id', $sender->profile->id)
                        ->where('is_main', true)
                        ->first();

                    if ($mainPhoto) {
                        $sender->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }

                return $sender;
            });

        // Get pending requests sent
        $pendingSent = Friendship::where('sender_id', $user->id)
            ->where('status', 'pending')
            ->with('receiver.profile', 'receiver.sports')
            ->get()
            ->map(function($friendship) {
                $receiver = $friendship->receiver;

                if ($receiver->profile) {
                    $mainPhoto = UserProfilePhoto::where('user_profile_id', $receiver->profile->id)
                        ->where('is_main', true)
                        ->first();

                    if ($mainPhoto) {
                        $receiver->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }

                return $receiver;
            });

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
