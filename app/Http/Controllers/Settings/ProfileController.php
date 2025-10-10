<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

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
            'name' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email,' . $user->id
            ],
        ]);


        // Prevent OAuth users from changing email
        if ($user->oauth_provider) {
            unset($validated['email']);
        }

        $user->update($validated);

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
