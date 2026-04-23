<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectAdminFromUserPages
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || !$user->is_admin) {
            return $next($request);
        }

        // Admins var piekļūt tikai admin lapām
        if (!$request->routeIs('admin.*') && !$request->routeIs('logout')) {
            return redirect()->route('admin.verification.dashboard');
        }

        return $next($request);
    }
}
