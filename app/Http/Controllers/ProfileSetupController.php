<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileStep1Request;
use App\Http\Requests\ProfileStep2Request;
use App\Http\Requests\ProfileStep3Request;
use App\Models\City;
use App\Models\Sport;
use App\Models\UserProfile;
use App\Models\UserSport;
use App\Models\UserProfilePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\AvailabilitySchedule;

class ProfileSetupController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    // Solis 1: Pamatinformācija
    public function step1(): Response
    {
        $user = Auth::user();
        $profile = $user->profile ?? new UserProfile();
        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Profile/Setup/Step1', [
            'profile' => $profile,
            'cities' => $cities,
            'currentStep' => 1,
            'totalSteps' => 5, // Updated to 5 steps
        ]);
    }

    // Saglabā 1. soli
    public function storeStep1(ProfileStep1Request $request)
    {
        $user = Auth::user();

        $profile = UserProfile::updateOrCreate(
            ['user_id' => $user->id],
            $request->validated()
        );

        return redirect()->route('profile.setup.step2')
            ->with('success', 'Pamatinformācija saglabāta!');
    }

    // Solis 2: Sporta veidi
    public function step2(): Response
    {
        $user = Auth::user();
        $sports = Sport::active()->orderBy('name')->get();
        $userSports = $user->userSports()
            ->with('sport')
            ->get()
            ->keyBy('sport_id');

        return Inertia::render('Profile/Setup/Step2', [
            'sports' => $sports,
            'userSports' => $userSports,
            'currentStep' => 2,
            'totalSteps' => 5,
        ]);
    }

    // Saglabā 2. soli
    public function storeStep2(ProfileStep2Request $request)
    {
        $user = Auth::user();
        $sportsData = $request->validated()['sports'];

        DB::transaction(function () use ($user, $sportsData) {
            $user->userSports()->delete();

            foreach ($sportsData as $sportData) {
                UserSport::create([
                    'user_id' => $user->id,
                    'sport_id' => $sportData['sport_id'],
                    'skill_level' => $sportData['skill_level'],
                    'is_preferred' => $sportData['is_preferred'] ?? false,
                ]);
            }
        });

        return redirect()->route('profile.setup.step3')
            ->with('success', 'Sporta veidi saglabāti!');
    }

    // Solis 3: Grafiks
    public function step3(): Response
    {
        $user = Auth::user();
        $existingSchedules = $user->availabilitySchedules()
            ->get()
            ->keyBy('day_of_week');

        return Inertia::render('Profile/Setup/Step3', [
            'existingSchedules' => $existingSchedules,
            'currentStep' => 3,
            'totalSteps' => 5,
        ]);
    }

    // Saglabā 3. soli
    public function storeStep3(ProfileStep3Request $request)
    {
        $user = Auth::user();
        $scheduleData = $request->validated()['schedule'] ?? [];

        DB::transaction(function () use ($user, $scheduleData) {
            $user->availabilitySchedules()->delete();

            foreach ($scheduleData as $dayData) {
                AvailabilitySchedule::create([
                    'user_id' => $user->id,
                    'day_of_week' => $dayData['day'],
                    'start_time' => $dayData['start_time'],
                    'end_time' => $dayData['end_time'],
                ]);
            }
        });

        return redirect()->route('profile.setup.step4')
            ->with('success', 'Pieejamības grafiks saglabāts!');
    }

    // NEW: Solis 4: Foto pievienošana
    public function step4(): Response
    {
        $user = Auth::user();
        $photos = $user->profile->photos ?? collect();

        return Inertia::render('Profile/Setup/Step4', [
            'photos' => $photos->map(fn($photo) => [
                'id' => $photo->id,
                'photo_url' => asset('storage/' . $photo->photo_path),
                'is_main' => $photo->is_main,
            ]),
            'currentStep' => 4,
            'totalSteps' => 5,
        ]);
    }

    // Saglabā 4. soli (foto)
    public function storeStep4(Request $request)
    {
        $user = Auth::user();

        // Check if user has at least one photo
        $photoCount = $user->profile->photos()->count();

        if ($photoCount < 1) {
            return back()->with('error', 'Jāpievieno vismaz viena fotogrāfija!');
        }

        return redirect()->route('profile.setup.step5')
            ->with('success', 'Foto pievienotas!');
    }

    // Upload photo during setup
    public function uploadSetupPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
        ]);

        $user = Auth::user();
        $profile = $user->profile;

        if (!$profile) {
            return back()->with('error', 'Profils nav atrasts!');
        }

        // Check photo limit (max 3)
        if ($profile->photos()->count() >= 3) {
            return back()->with('error', 'Maksimums 3 fotogrāfijas!');
        }

        $file = $request->file('photo');
        $path = $file->store('profile-photos', 'public');

        // If this is the first photo, make it main
        $isFirstPhoto = $profile->photos()->count() === 0;

        $photo = UserProfilePhoto::create([
            'user_profile_id' => $profile->id,
            'photo_path' => $path,
            'is_main' => $isFirstPhoto,
        ]);

        return back()->with('success', 'Foto pievienota!');
    }

    // Delete photo during setup
    public function deleteSetupPhoto($photoId)
    {
        $user = Auth::user();
        $photo = UserProfilePhoto::where('id', $photoId)
            ->whereHas('userProfile', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->firstOrFail();

        // Delete file from storage
        if (Storage::disk('public')->exists($photo->photo_path)) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $wasMain = $photo->is_main;
        $photo->delete();

        // If deleted photo was main, set another as main
        if ($wasMain) {
            $newMain = $user->profile->photos()->first();
            if ($newMain) {
                $newMain->update(['is_main' => true]);
            }
        }

        return back()->with('success', 'Foto dzēsta!');
    }

    // Set main photo during setup
    public function setMainSetupPhoto($photoId)
    {
        $user = Auth::user();
        $photo = UserProfilePhoto::where('id', $photoId)
            ->whereHas('userProfile', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->firstOrFail();

        // Remove main from all photos
        $user->profile->photos()->update(['is_main' => false]);

        // Set this photo as main
        $photo->update(['is_main' => true]);

        return back()->with('success', 'Galvenā foto iestatīta!');
    }

    // Solis 5: Bio un pabeigšana (previously step 4)
    public function step5(): Response
    {
        $user = Auth::user();
        $profile = $user->profile;

        return Inertia::render('Profile/Setup/Step5', [
            'profile' => $profile,
            'currentStep' => 5,
            'totalSteps' => 5,
        ]);
    }

    // Saglabā 5. soli un pabeidz setup
    public function storeStep5(Request $request)
    {
        $request->validate([
            'bio' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $user->profile()->update([
            'bio' => $request->bio,
        ]);

        return redirect()->route('dashboard')
            ->with('success', 'Profils izveidots! Laipni lūgti SportMatch!');
    }
}
