<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        // If already verified, redirect to dashboard
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard')->with('info', 'E-pasts jau ir apstiprināts!');
        }

        // Mark email as verified
        $request->fulfill();

        // Redirect to dashboard with success message
        return redirect()->route('dashboard')->with('success', 'E-pasts veiksmīgi apstiprināts!');
    }
}
