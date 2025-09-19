<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupEvent;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController
{
    public function index()
    {
        $user = Auth::user()->load(['profile', 'sports']);

        // Get user's groups (where they are a member or creator)
        $myGroups = Group::where('creator_id', $user->id)
            ->orWhereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('status', 'approved');
            })
            ->with(['creator', 'sports', 'members' => function($q) {
                $q->where('status', 'approved');
            }])
            ->withCount(['approvedMembers'])
            ->get()
            ->map(function($group) use ($user) {
                // Add user's role in this group
                if ($group->creator_id === $user->id) {
                    $group->pivot = (object) ['role' => 'admin'];
                } else {
                    $member = $group->members->where('id', $user->id)->first();
                    if ($member) {
                        $group->pivot = (object) ['role' => $member->pivot->role];
                    }
                }
                return $group;
            });

        // Get upcoming events from user's groups
        $upcomingEvents = GroupEvent::whereHas('group.members', function($q) use ($user) {
            $q->where('user_id', $user->id)
                ->where('status', 'approved');
        })
            ->orWhereHas('group', function($q) use ($user) {
                $q->where('creator_id', $user->id);
            })
            ->where('event_date', '>=', now())
            ->where('status', 'upcoming')
            ->with(['group'])
            ->withCount('confirmedParticipants')
            ->orderBy('event_date')
            ->limit(5)
            ->get()
            ->map(function($event) {
                // Rename title to name for frontend compatibility
                $event->name = $event->title;
                return $event;
            });

        return Inertia::render('dashboard', [
            'user' => $user,
            'myGroups' => $myGroups,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
