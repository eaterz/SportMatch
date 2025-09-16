<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupEvent;
use App\Models\GroupPost;
use App\Models\Sport;
use App\Models\User;
use App\Models\UserProfilePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GroupsController extends Controller
{
    /**
     * Rāda grupu sarakstu un meklēšanu
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Manas grupas
        $myGroups = Group::where('creator_id', $user->id)
            ->orWhereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->where('status', 'approved');
            })
            ->with(['creator', 'sports', 'members'])
            ->withCount('approvedMembers')
            ->get();

        // Visas publiskās grupas
        $query = Group::where('is_active', true)
            ->where('is_private', false)
            ->with(['creator', 'sports'])
            ->withCount('approvedMembers');

        // Meklēšana
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filtrēt pēc sporta
        if ($request->filled('sport_id')) {
            $query->whereHas('sports', function($q) use ($request) {
                $q->where('sport_id', $request->sport_id);
            });
        }

        // Filtrēt pēc atrašanās vietas
        if ($request->filled('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        $publicGroups = $query->paginate(12);

        // Pievieno dalības statusu
        $publicGroups->through(function($group) use ($user) {
            $group->is_member = $group->isMember($user);
            $group->is_admin = $group->isAdmin($user);
            $group->has_pending_request = $group->pendingMembers()
                ->where('user_id', $user->id)
                ->exists();
            return $group;
        });

        $sports = Sport::where('is_active', true)->get();

        return Inertia::render('Groups/Index', [
            'user' => $user,
            'myGroups' => $myGroups,
            'publicGroups' => $publicGroups,
            'sports' => $sports,
            'filters' => $request->only(['search', 'sport_id', 'location'])
        ]);
    }

    /**
     * Rāda grupas izveidošanas formu
     */
    public function create()
    {
        $sports = Sport::where('is_active', true)->get();

        return Inertia::render('Groups/Create', [
            'sports' => $sports
        ]);
    }

    /**
     * Izveido jaunu grupu
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:100',
            'max_members' => 'nullable|integer|min:2|max:100',
            'is_private' => 'boolean',
            'sports' => 'required|array|min:1',
            'sports.*.id' => 'required|exists:sports,id',
            'sports.*.skill_level' => 'required|in:beginner,intermediate,advanced,all',
            'cover_photo' => 'nullable|image|max:5120'
        ]);

        $user = Auth::user();

        // Izveido grupu
        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'creator_id' => $user->id,
            'location' => $request->location,
            'max_members' => $request->max_members,
            'is_private' => $request->is_private ?? false,
            'is_active' => true
        ]);

        // Saglabā cover foto
        if ($request->hasFile('cover_photo')) {
            $path = $request->file('cover_photo')->store('group-covers', 'public');
            $group->update(['cover_photo' => $path]);
        }

        // Pievieno sporta veidus
        foreach ($request->sports as $sport) {
            $group->sports()->attach($sport['id'], [
                'skill_level' => $sport['skill_level']
            ]);
        }

        // Pievieno izveidotāju kā adminu
        $group->members()->attach($user->id, [
            'role' => 'admin',
            'status' => 'approved',
            'joined_at' => now()
        ]);

        return redirect()->route('groups.show', $group)
            ->with('success', 'Grupa veiksmīgi izveidota!');
    }

    /**
     * Rāda konkrētu grupu
     */
    public function show(Group $group)
    {
        $user = Auth::user();

        // Ielādē attiecības
        $group->load([
            'creator',
            'sports',
            'approvedMembers' => function($q) {
                $q->with('profile')->limit(10);
            }
        ]);

        $group->loadCount('approvedMembers');

        // Pārbauda lietotāja statusu
        $group->is_member = $group->isMember($user);
        $group->is_admin = $group->isAdmin($user);
        $group->has_pending_request = $group->pendingMembers()
            ->where('user_id', $user->id)
            ->exists();

        // Iegūst jaunākās ziņas
        $posts = $group->posts()
            ->with(['user.profile', 'comments.user'])
            ->withCount(['likes', 'comments'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($post) use ($user) {
                $post->is_liked = $post->isLikedBy($user);

                // Pievieno lietotāja profila bildi
                if ($post->user->profile) {
                    $mainPhoto = UserProfilePhoto::where('user_profile_id', $post->user->profile->id)
                        ->where('is_main', true)
                        ->first();
                    if ($mainPhoto) {
                        $post->user->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }

                return $post;
            });

        // Iegūst nākamos pasākumus
        $upcomingEvents = $group->upcomingEvents()
            ->with('creator')
            ->withCount('confirmedParticipants')
            ->limit(5)
            ->get()
            ->map(function($event) use ($user) {
                $event->is_participating = $event->isParticipating($user);
                return $event;
            });

        return Inertia::render('Groups/Show', [
            'user' => $user,
            'group' => $group,
            'posts' => $posts,
            'upcomingEvents' => $upcomingEvents
        ]);
    }

    /**
     * Pievienoties grupai
     */
    public function join(Group $group)
    {
        $user = Auth::user();

        if ($group->isMember($user)) {
            return back()->with('error', 'Jūs jau esat šīs grupas dalībnieks');
        }

        if ($group->isFull()) {
            return back()->with('error', 'Grupa ir pilna');
        }

        $status = $group->is_private ? 'pending' : 'approved';
        $group->addMember($user, $status);

        if ($status === 'pending') {
            return back()->with('success', 'Pieteikums nosūtīts. Gaidiet administratora apstiprinājumu.');
        }

        return back()->with('success', 'Veiksmīgi pievienojāties grupai!');
    }

    /**
     * Pamest grupu
     */
    public function leave(Group $group)
    {
        $user = Auth::user();

        if ($group->creator_id === $user->id) {
            return back()->with('error', 'Grupas izveidotājs nevar pamest grupu');
        }

        $group->removeMember($user);

        return back()->with('success', 'Jūs esat pametis grupu');
    }

    /**
     * Dalībnieku saraksts
     */
    public function members(Group $group)
    {
        $user = Auth::user();

        if (!$group->isMember($user) && !$group->is_private) {
            return back()->with('error', 'Tikai grupas dalībnieki var redzēt dalībnieku sarakstu');
        }

        $members = $group->approvedMembers()
            ->with('profile')
            ->withPivot(['role', 'joined_at'])
            ->get()
            ->map(function($member) {
                // Pievieno profila bildi
                if ($member->profile) {
                    $mainPhoto = UserProfilePhoto::where('user_profile_id', $member->profile->id)
                        ->where('is_main', true)
                        ->first();
                    if ($mainPhoto) {
                        $member->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }
                return $member;
            });

        $pendingMembers = [];
        if ($group->isAdmin($user)) {
            $pendingMembers = $group->pendingMembers()
                ->with('profile')
                ->get();
        }

        return Inertia::render('Groups/Members', [
            'user' => $user,
            'group' => $group,
            'members' => $members,
            'pendingMembers' => $pendingMembers,
            'is_admin' => $group->isAdmin($user)
        ]);
    }

    /**
     * Apstiprināt dalībnieku (tikai adminiem)
     */
    public function approveMember(Group $group, User $member)
    {
        $user = Auth::user();

        if (!$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        $group->approveMember($member);

        return back()->with('success', 'Dalībnieks apstiprināts');
    }

    /**
     * Noņemt dalībnieku (tikai adminiem)
     */
    public function removeMember(Group $group, User $member)
    {
        $user = Auth::user();

        if (!$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($member->id === $group->creator_id) {
            return back()->with('error', 'Nevar noņemt grupas izveidotāju');
        }

        $group->removeMember($member);

        return back()->with('success', 'Dalībnieks noņemts');
    }
}
