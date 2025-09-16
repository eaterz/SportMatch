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
        $user = Auth::user()->load(['profile.photos', 'sports']);

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'photos' => $user->profile ? $user->profile->photos : []
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


        if ($photo->userProfile->user_id !== $user->id) {
            return back()->with('error', 'Nav atļauts');
        }


        Storage::disk('public')->delete($photo->photo_path);


        if ($photo->is_main) {
            $nextPhoto = $user->profile->photos()
                ->where('id', '!=', $photo->id)
                ->first();

            if ($nextPhoto) {
                $nextPhoto->update(['is_main' => true]);
            }
        }


        $photo->delete();

        return back()->with('success', 'Foto dzēsta');
    }


    public function update(Request $request)
    {
        $request->validate([
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:100',
            'bio' => 'nullable|string|max:500'
        ]);

        $user = Auth::user();

        if (!$user->profile) {
            return back()->with('error', 'Profils nav atrasts');
        }

        $user->profile->update($request->only(['phone', 'location', 'bio']));

        return back()->with('success', 'Profils atjaunināts');
    }
}
