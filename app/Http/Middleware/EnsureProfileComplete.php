<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureProfileComplete
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Ja nav pieslēdzies, ļauj turpināt
        if (!$user) {
            return $next($request);
        }

        // Ja jau ir setup route, ļauj turpināt
        if ($request->routeIs('profile.setup.*')) {
            return $next($request);
        }

        // Pārbauda vai profils ir pabeigts
        if (!$user->has_complete_profile) {
            return redirect()->route('profile.setup.step1');
        }

        return $next($request);
    }
}
