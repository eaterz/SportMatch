<?php

namespace App\Http\Controllers;

use App\Models\UserProfilePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{

    public function show()
    {
        $user = Auth::user()->load([
            'profile.photos',
            'profile.city',
            'sports',
            'verificationRequests' => function($query) {
                $query->latest()->limit(1);
            }
        ]);

        $cities = \App\Models\City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'photos' => $user->profile ? $user->profile->photos : [],
            'cities' => $cities
        ]);
    }



    public function updateBio(Request $request)
    {
        $request->validate([
            'bio' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        if (!$user->profile) {
            return back()->with('error', 'Profils nav atrasts');
        }

        $user->profile->update([
            'bio' => $request->bio
        ]);

        return back()->with('success', 'Bio veiksmīgi atjaunināts');
    }


    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120' // 5MB max
        ]);

        $user = Auth::user();

        if (!$user->profile) {
            return back()->with('error', 'Profils nav atrasts');
        }

        try {

            $path = $request->file('photo')->store('profile-photos', 'public');


            $isMain = $request->boolean('is_main', false);


            if ($isMain || !$user->profile->photos()->exists()) {
                $user->profile->photos()->update(['is_main' => false]);
                $isMain = true;
            }


            $photo = $user->profile->photos()->create([
                'photo_path' => $path,
                'is_main' => $isMain
            ]);

            return back()->with('success', 'Foto veiksmīgi augšupielādēta');
        } catch (\Exception $e) {
            return back()->with('error', 'Kļūda augšupielādējot foto: ' . $e->getMessage());
        }
    }

    public function setMainPhoto(UserProfilePhoto $photo)
    {
        $user = Auth::user();


        if ($photo->userProfile->user_id !== $user->id) {
            return back()->with('error', 'Nav atļauts');
        }


        $user->profile->photos()->update(['is_main' => false]);


        $photo->update(['is_main' => true]);

        return back()->with('success', 'Galvenā foto nomainīta');
    }


    public function deletePhoto(UserProfilePhoto $photo)
    {
        $user = Auth::user();

        // Check if user owns this photo
        if ($photo->userProfile->user_id !== $user->id) {
            return back()->with('error', 'Nav atļauts');
        }

        // Check if this is the last photo
        $photoCount = $user->profile->photos()->count();

        if ($photoCount <= 1) {
            return back()->with('error', 'Nevar dzēst pēdējo foto. Jābūt vismaz vienai bildei profilā.');
        }

        // Delete from storage
        Storage::disk('public')->delete($photo->photo_path);

        // If deleting main photo, set another photo as main
        if ($photo->is_main) {
            $nextPhoto = $user->profile->photos()
                ->where('id', '!=', $photo->id)
                ->first();

            if ($nextPhoto) {
                $nextPhoto->update(['is_main' => true]);
            }
        }

        // Delete photo record
        $photo->delete();

        return back()->with('success', 'Foto dzēsta');
    }


    public function update(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'bio' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        if (!$user->profile) {
            return back()->with('error', 'Profils nav atrasts');
        }

        $user->profile->update($request->only(['city_id', 'bio']));

        return back()->with('success', 'Profils atjaunināts');
    }
}
