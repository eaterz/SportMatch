<?php


namespace App\Http\Controllers;

use App\Http\Requests\ProfileStep1Request;
use App\Http\Requests\ProfileStep2Request;
use App\Http\Requests\ProfileStep3Request;
use App\Models\Sport;
use App\Models\UserProfile;
use App\Models\UserSport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('Profile/Setup/Step1', [
            'profile' => $profile,
            'currentStep' => 1,
            'totalSteps' => 4,
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
            'totalSteps' => 4,
        ]);
    }

    // Saglabā 2. soli
    public function storeStep2(ProfileStep2Request $request)
    {
        $user = Auth::user();
        $sportsData = $request->validated()['sports'];


        DB::transaction(function () use ($user, $sportsData) {
            // Dzēš esošos sporta veidus
            $user->userSports()->delete();

            // Pievieno jaunos
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

    // Solis 3: Grafiks (pagaidām vienkārš)
    public function step3(): Response
    {
        $user = Auth::user();
        $existingSchedules = $user->availabilitySchedules()
            ->get()
            ->keyBy('day_of_week');

        return Inertia::render('Profile/Setup/Step3', [
            'existingSchedules' => $existingSchedules,
            'currentStep' => 3,
            'totalSteps' => 4,
        ]);
    }


    // Saglabā 3. soli (pagaidām tukš)
    public function storeStep3(ProfileStep3Request $request)
    {
        $user = Auth::user();
        $scheduleData = $request->validated()['schedule'] ?? [];

        DB::transaction(function () use ($user, $scheduleData) {
            // Dzēš esošo grafiku
            $user->availabilitySchedules()->delete();

            // Pievieno jauno grafiku
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

    // Solis 4: Bio un pabeigšana
    public function step4(): Response
    {
        $user = Auth::user();
        $profile = $user->profile;

        return Inertia::render('Profile/Setup/Step4', [
            'profile' => $profile,
            'currentStep' => 4,
            'totalSteps' => 4,
        ]);
    }

    // Saglabā 4. soli un pabeidz setup
    public function storeStep4(Request $request)
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

    // Pārbauda vai solis ir pieejams
    private function canAccessStep(int $step): bool
    {
        $user = Auth::user();

        return match($step) {
            1 => true,
            2 => $user->profile && $user->profile->is_complete,
            3 => $user->sports()->count() > 0,
            4 => true,
            default => false,
        };
    }
}





