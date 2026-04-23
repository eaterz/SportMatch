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

        // Nav pieslēdzies — turpina
        if (!$user) {
            return $next($request);
        }

        // Admins — profila pārbaude nav vajadzīga
        if ($user->is_admin) {
            return $next($request);
        }

        // Profila setup lapas — turpina
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
