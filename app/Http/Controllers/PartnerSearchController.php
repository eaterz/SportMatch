<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Friendship;
use App\Models\Sport;
use App\Models\City;
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
        $user->load('profile.city'); // Load city relationship

        $query = User::where('id', '!=', $user->id)
            ->where('is_admin', false)
            ->with([
                'profile.photos',
                'profile.city', // ADD THIS
                'sports',
                'availabilitySchedules'
            ]);

        // Search by name or city
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhereHas('profile.city', function($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by sport
        if ($request->filled('sport')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('sports.id', $request->sport);
            });
        }

        // Filter by skill level
        if ($request->filled('skill_level')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('user_sports.skill_level', $request->skill_level);
            });
        }

        // Distance filter
        if ($request->filled('max_distance') && $user->profile && $user->profile->city_id) {
            $maxDistance = (int)$request->max_distance;
            $userCity = $user->profile->city;

            if ($userCity) {
                // Get cities within distance
                $nearbyCityIds = City::withinDistance(
                    $userCity->latitude,
                    $userCity->longitude,
                    $maxDistance
                )->pluck('id')->toArray();

                $query->whereHas('profile', function($q) use ($nearbyCityIds) {
                    $q->whereIn('city_id', $nearbyCityIds);
                });
            }
        }

        $partners = $query->get()->map(function($partner) use ($user) {
            // Prepare profile data
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

                // Add city name for display
                if ($partner->profile->city) {
                    $partner->profile->location = $partner->profile->city->name;

                    // Calculate distance if both users have cities
                    if ($user->profile && $user->profile->city) {
                        $distance = $user->profile->city->distanceTo($partner->profile->city);
                        $partner->distance = round($distance, 1);
                    }
                }
            }

            // Availability schedules
            $partner->availability_schedules = $partner->availabilitySchedules->map(function($schedule) {
                return [
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time
                ];
            });

            // Friendship status
            $sentFriendship = Friendship::where('sender_id', $user->id)
                ->where('receiver_id', $partner->id)
                ->first();

            $receivedFriendship = Friendship::where('sender_id', $partner->id)
                ->where('receiver_id', $user->id)
                ->first();

            if ($sentFriendship) {
                $partner->friendship_status = $sentFriendship->status === 'accepted' ? 'friends' : 'pending_sent';
            } else if ($receivedFriendship) {
                $partner->friendship_status = $receivedFriendship->status === 'accepted' ? 'friends' : 'pending_received';
            } else {
                $partner->friendship_status = 'none';
            }

            return $partner;
        });

        // Sort by distance if filter applied
        if ($request->filled('max_distance') && $user->profile && $user->profile->city_id) {
            $partners = $partners->sortBy('distance')->values();
        }

        $sports = Sport::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'icon']);

        $cities = City::orderBy('population', 'desc')
            ->get(['id', 'name', 'region']);

        return Inertia::render('PartnerSearch', [
            'user' => $user,
            'partners' => $partners,
            'sports' => $sports,
            'cities' => $cities,
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
