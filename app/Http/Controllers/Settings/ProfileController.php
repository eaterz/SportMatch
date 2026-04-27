<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;
use App\Notifications\VerifyPendingEmail;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'user' => Auth::user()->load('profile'),
            'mustVerifyEmail' => Auth::user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

// Add this method
    public function sendVerification(Request $request)
    {
        $user = $request->user();

        // Don't send if already verified or OAuth user
        if ($user->hasVerifiedEmail() || $user->oauth_provider) {
            return back();
        }

        $user->sendEmailVerificationNotification();
        \Log::info('Verification email sent to: '.$user->email);


        return back()->with('status', 'verification-link-sent');
    }


    /**
     * Update the user's profile settings.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-]+$/u'],
            'lastname' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-]+$/u'],
            'email' => [
                'required', 'string', 'email', 'max:255',
                'unique:users,email,' . $user->id,
                'unique:users,pending_email,' . $user->id,
            ],
        ], [
            'name.required'     => 'Vārds ir obligāts.',
            'name.regex'        => 'Vārdā drīkst būt tikai burti.',
            'lastname.required' => 'Uzvārds ir obligāts.',
            'lastname.regex'    => 'Uzvārdā drīkst būt tikai burti.',
            'email.required'    => 'E-pasts ir obligāts.',
            'email.email'       => 'Ievadi derīgu e-pasta adresi.',
            'email.unique'      => 'Šis e-pasts jau ir reģistrēts.',
        ]);

        if ($user->oauth_provider) {
            unset($validated['email']);
        }


        $user->update([
            'name' => $validated['name'],
            'lastname' => $validated['lastname'],
        ]);


        if (!$user->oauth_provider && $validated['email'] !== $user->email) {
            $user->pending_email = $validated['email'];
            $user->save();

            // Send to pending_email, not current email
            Notification::route('mail', $user->pending_email)
                ->notify(new VerifyPendingEmail($user));
        }

        return back()->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */

    public function verifyPendingEmail(Request $request, \App\Models\User $user)
    {
        if (!$request->hasValidSignature()) {
            abort(403);
        }

        if (!$user->pending_email) {
            return redirect()->route('profile.settings.edit')
                ->with('status', 'no-pending-email');
        }

        $user->email = $user->pending_email;
        $user->pending_email = null;
        $user->email_verified_at = now();
        $user->save();

        return redirect()->route('profile.settings.edit')
            ->with('status', 'email-updated');
    }

    public function cancelEmailChange(Request $request)
    {
        $request->user()->update(['pending_email' => null]);

        return back()->with('status', 'email-change-cancelled');
    }
    public function destroy(Request $request)
    {
        $user = $request->user();

        Auth::logout();

        if ($user->profile && $user->profile->photos) {
            foreach ($user->profile->photos as $photo) {
                \Storage::disk('public')->delete($photo->photo_path);
            }
        }

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Inertia::location(route('home'));
    }
}
