<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {


        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard')->with('info', 'E-pasts jau ir apstiprināts!');
        }

        $request->fulfill();

        Log::info('Email verified successfully for user: ' . $request->user()->id);

        return redirect()->route('dashboard')->with('success', 'E-pasts veiksmīgi apstiprināts!');
    }
}
