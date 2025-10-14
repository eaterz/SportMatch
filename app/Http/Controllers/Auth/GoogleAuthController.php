<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth page
     */
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user exists
            $user = User::where('email', $googleUser->email)->first();

            if ($user) {
                // Update OAuth info if not set
                if (!$user->oauth_provider) {
                    $user->oauth_provider = 'google';
                    $user->oauth_id = $googleUser->id;
                    $user->save();
                }

                // ALWAYS verify email for OAuth users
                if (!$user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();

                    Log::info('Email verified for OAuth user', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                }

                // User exists, just log them in
                Auth::login($user);

                // Check if user is admin
                if ($user->is_admin) {
                    return redirect()->route('admin.verification.dashboard');
                }

                // Check if profile is complete
                if (!$user->has_complete_profile) {
                    return redirect()->route('profile.setup.step1');
                }

                return redirect()->route('dashboard');
            }

            // Create new user with auto-verified email
            $nameParts = explode(' ', $googleUser->name);
            $firstName = $nameParts[0] ?? '';
            $lastName = isset($nameParts[1]) ? implode(' ', array_slice($nameParts, 1)) : '';

            $user = User::create([
                'name' => $firstName,
                'lastname' => $lastName ?: $firstName,
                'email' => $googleUser->email,
                'password' => Hash::make(Str::random(24)),
                'email_verified_at' => now(), // Auto-verify email for Google users
                'oauth_provider' => 'google',
                'oauth_id' => $googleUser->id,
            ]);

            Log::info('Created new OAuth user', [
                'user_id' => $user->id,
                'oauth_provider' => $user->oauth_provider,
                'oauth_id' => $user->oauth_id,
                'email_verified' => true
            ]);

            Auth::login($user);

            // Redirect to profile setup
            return redirect()->route('profile.setup.step1')
                ->with('success', 'Konts izveidots! Tagad aizpildi savu profilu.');

        } catch (\Exception $e) {
            Log::error('Google OAuth error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('login')
                ->with('error', 'Neizdevās pieslēgties ar Google. Lūdzu, mēģini vēlreiz.');
        }
    }
}
