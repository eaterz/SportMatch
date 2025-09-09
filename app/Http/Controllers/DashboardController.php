<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController
{
    public function index()
    {
        $user = Auth::user()->load(['profile', 'sports.sport']);

        return Inertia::render('Dashboard', [
            'user' => $user,
            'recentActivities' => [], // Pagaidām tukšs, jo nav activities model
            'suggestedPartners' => [], // Pagaidām tukšs, jo nav matching service
            'upcomingEvents' => [], // Pagaidām tukšs, jo nav events model
        ]);
    }

}
