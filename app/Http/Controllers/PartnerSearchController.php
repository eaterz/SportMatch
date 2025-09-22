<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Sport;
use App\Models\UserProfilePhoto;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class PartnerSearchController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = User::where('id', '!=', $user->id)
            ->with([
                'profile.photos',
                'sports',
                'availabilitySchedules'
            ]);


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


        if ($request->filled('sport')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('sports.id', $request->sport);
            });
        }

        if ($request->filled('skill_level')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('user_sports.skill_level', $request->skill_level);
            });
        }


        $partners = $query->get()->map(function($partner) use ($user) {

            if ($partner->profile) {

                $mainPhoto = $partner->profile->photos()
                    ->where('is_main', true)
                    ->first();

                if ($mainPhoto) {
                    $partner->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                } else {
                    $partner->profile->main_photo = null;
                }

                $partner->profile->photos = $partner->profile->photos->map(function($photo) {
                    return [
                        'id' => $photo->id,
                        'photo_url' => '/storage/' . $photo->photo_path,
                        'is_main' => $photo->is_main
                    ];
                });

                $partner->profile->age = $partner->profile->age;
            }

            $partner->availability_schedules = $partner->availabilitySchedules->map(function($schedule) {
                return [
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time
                ];
            });

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
        NotificationService::friendRequest($user, $receiver);

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
