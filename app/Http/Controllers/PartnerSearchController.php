<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PartnerSearchController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Get all users except current user
        $partners = User::where('id', '!=', $user->id)
            ->with(['profile', 'sports'])
            ->get()
            ->map(function($partner) use ($user) {
                // Check friendship status
                $sentFriendship = Friendship::where('sender_id', $user->id)
                    ->where('receiver_id', $partner->id)
                    ->first();

                $receivedFriendship = Friendship::where('sender_id', $partner->id)
                    ->where('receiver_id', $user->id)
                    ->first();

                if ($sentFriendship) {
                    if ($sentFriendship->status === 'accepted') {
                        $partner->friendship_status = 'friends';
                    } else if ($sentFriendship->status === 'pending') {
                        $partner->friendship_status = 'pending_sent';
                    }
                } else if ($receivedFriendship) {
                    if ($receivedFriendship->status === 'accepted') {
                        $partner->friendship_status = 'friends';
                    } else if ($receivedFriendship->status === 'pending') {
                        $partner->friendship_status = 'pending_received';
                    }
                } else {
                    $partner->friendship_status = 'none';
                }

                return $partner;
            });

        return Inertia::render('PartnerSearch', [
            'user' => $user,
            'partners' => $partners
        ]);
    }

    public function sendFriendRequest(Request $request, User $receiver)
    {
        $user = Auth::user();

        // Check if friendship already exists
        $exists = Friendship::where(function($q) use ($user, $receiver) {
            $q->where('sender_id', $user->id)
                ->where('receiver_id', $receiver->id);
        })->orWhere(function($q) use ($user, $receiver) {
            $q->where('sender_id', $receiver->id)
                ->where('receiver_id', $user->id);
        })->exists();

        if (!$exists) {
            Friendship::create([
                'sender_id' => $user->id,
                'receiver_id' => $receiver->id,
                'status' => 'pending'
            ]);
        }

        return back();
    }

    public function acceptFriendRequest(User $sender)
    {
        $user = Auth::user();

        $friendship = Friendship::where('sender_id', $sender->id)
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($friendship) {
            $friendship->update([
                'status' => 'accepted',
                'accepted_at' => now()
            ]);
        }

        return back();
    }
}
