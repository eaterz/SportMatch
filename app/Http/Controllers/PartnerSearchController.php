<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Sport;
use App\Models\UserProfilePhoto;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PartnerSearchController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Build query with filters
        $query = User::where('id', '!=', $user->id)
            ->with(['profile', 'sports']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhereHas('profile', function($q) use ($search) {
                        $q->where('location', 'like', "%{$search}%");
                    });
            });
        }

        // Sport filter
        if ($request->filled('sport')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('sports.id', $request->sport);
            });
        }

        // Skill level filter
        if ($request->filled('skill_level')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('user_sports.skill_level', $request->skill_level);
            });
        }

        // Get all partners with filters applied
        $partners = $query->get()->map(function($partner) use ($user) {
            // Get main photo for each partner
            if ($partner->profile) {
                // Get the main photo directly from database
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $partner->profile->id)
                    ->where('is_main', true)
                    ->first();

                // Set main_photo as string URL, not object
                if ($mainPhoto) {
                    $partner->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                } else {
                    $partner->profile->main_photo = null;
                }

                // Make sure age is included
                $partner->profile->age = $partner->profile->age;
            }

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

        // Get all active sports for filter dropdown
        $sports = Sport::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'icon']);

        return Inertia::render('PartnerSearch', [
            'user' => $user,
            'partners' => $partners,
            'sports' => $sports,
            'filters' => $request->only(['search', 'sport', 'skill_level', 'max_distance'])
        ]);
    }

    public function sendFriendRequest($receiverId)
    {
        $user = Auth::user();
        $receiver = User::findOrFail($receiverId);

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

        return back()->with('success', 'Draudzības pieprasījums nosūtīts!');
    }

    public function acceptFriendRequest($senderId)
    {
        $user = Auth::user();
        $sender = User::findOrFail($senderId);

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

        return back()->with('success', 'Draudzības pieprasījums pieņemts!');
    }
}
