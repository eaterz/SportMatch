<?php

namespace App\Http\Controllers;

use App\Events\GroupCommentAdded;
use App\Events\GroupPostCreated;
use App\Events\GroupPostDeleted;
use App\Events\GroupPostLiked;
use App\Models\City;
use App\Models\Group;
use App\Models\GroupEvent;
use App\Models\GroupPost;
use App\Models\GroupPostComment;
use App\Models\Sport;
use App\Models\User;
use App\Models\UserProfilePhoto;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GroupsController extends Controller
{

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


    public function create()
    {
        $sports = Sport::where('is_active', true)->get();
        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Groups/Create', [
            'sports' => $sports,
            'cities' => $cities
        ]);
    }


    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'city_id' => 'required|exists:cities,id',
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
            'city_id' => $request->city_id,
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


    public function show(Group $group)
    {
        $user = Auth::user();

        $group->load(['creator', 'sports', 'city']);
        $group->loadCount('approvedMembers');

        $cities = \App\Models\City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        $group->is_member = $group->isMember($user);
        $group->is_admin = $group->isAdmin($user);
        $group->has_pending_request = $group->pendingMembers()
            ->where('user_id', $user->id)
            ->exists();


        $approvedMembers = $group->approvedMembers()
            ->with('profile')
            ->take(10)
            ->get()
            ->map(function($member) {
                if ($member && $member->profile) {
                    $mainPhoto = \App\Models\UserProfilePhoto::where('user_profile_id', $member->profile->id)
                        ->where('is_main', true)
                        ->first();
                    if ($mainPhoto) {
                        $member->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }
                return $member;
            });


        $posts = $group->posts()
            ->with([
                'user.profile',
                'comments' => function($query) {
                    $query->with('user.profile')->latest()->limit(3);
                }
            ])
            ->withCount(['likes', 'comments'])
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($post) use ($user) {

                if (!$post->user) {
                    return null;
                }

                $post->is_liked = $post->isLikedBy($user);


                if ($post->user->profile) {
                    $mainPhoto = \App\Models\UserProfilePhoto::where('user_profile_id', $post->user->profile->id)
                        ->where('is_main', true)
                        ->first();
                    if ($mainPhoto) {
                        $post->user->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                    }
                }


                $post->comments->each(function($comment) {

                    if ($comment->user && $comment->user->profile) {
                        $mainPhoto = \App\Models\UserProfilePhoto::where('user_profile_id', $comment->user->profile->id)
                            ->where('is_main', true)
                            ->first();
                        if ($mainPhoto) {
                            $comment->user->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                        }
                    }
                });

                return $post;
            })
            ->filter()
            ->values();

        $upcomingEvents = $group->upcomingEvents()
            ->with(['creator', 'city'])
            ->withCount('confirmedParticipants')
            ->limit(5)
            ->get()
            ->map(function($event) use ($user) {

                if (!$event->creator) {
                    return null;
                }

                $event->is_participating = $event->isParticipating($user);
                return $event;
            })
            ->filter()
            ->values();

        return Inertia::render('Groups/Show', [
            'user' => $user,
            'group' => $group,
            'approvedMembers' => $approvedMembers,
            'posts' => $posts,
            'upcomingEvents' => $upcomingEvents,
            'pusherKey' => config('broadcasting.connections.pusher.key'),
            'pusherCluster' => config('broadcasting.connections.pusher.options.cluster'),
            'cities' => $cities
        ]);
    }



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


    public function leave(Group $group)
    {
        $user = Auth::user();

        if ($group->creator_id === $user->id) {
            return back()->with('error', 'Grupas izveidotājs nevar pamest grupu');
        }

        $group->removeMember($user);

        return back()->with('success', 'Jūs esat pametis grupu');
    }


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


    public function approveMember(Group $group, User $member)
    {
        $user = Auth::user();

        if (!$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        $group->approveMember($member);

        return back()->with('success', 'Dalībnieks apstiprināts');
    }


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

    public function createPost(Request $request, Group $group)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Tikai grupas dalībnieki var publicēt ierakstus');
        }

        $request->validate([
            'content' => 'required|string|max:2000',
            'image' => 'nullable|image|max:5120', // 5MB max
            'is_announcement' => 'boolean'
        ]);

        $post = GroupPost::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'content' => $request->input('content'),
            'is_announcement' => $request->input('is_announcement', false) && $group->isAdmin($user)
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('group-posts', 'public');
            $post->update(['image' => $path]);
        }


        $post->load(['user.profile']);


        broadcast(new GroupPostCreated($post))->toOthers();

        return back()->with('success', 'Ieraksts publicēts!');
    }


    public function togglePostLike(Request $request, Group $group, GroupPost $post)
    {
        $user = Auth::user();


        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }


        if ($post->group_id !== $group->id) {
            return back()->with('error', 'Ieraksts nav no šīs grupas');
        }

        if ($post->isLikedBy($user)) {
            $post->removeLike($user);
        } else {
            $post->addLike($user);
        }


        broadcast(new GroupPostLiked($post, $user))->toOthers();

        return back();
    }


    public function addComment(Request $request, Group $group, GroupPost $post)
    {
        $user = Auth::user();


        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }


        if ($post->group_id !== $group->id) {
            return back()->with('error', 'Ieraksts nav no šīs grupas');
        }

        $request->validate([
            'content' => 'required|string|max:500'
        ]);

        $comment = GroupPostComment::create([
            'post_id' => $post->id,
            'user_id' => $user->id,
            'content' => $request->input('content')
        ]);
        NotificationService::groupPostComment($comment, $post, $group);


        $post->increment('comments_count');


        $comment->load(['user.profile']);


        broadcast(new GroupCommentAdded($comment, $group))->toOthers();

        return back()->with('success', 'Komentārs pievienots!');
    }


    public function deletePost(Group $group, GroupPost $post)
    {
        $user = Auth::user();


        if ($post->user_id !== $user->id && !$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību dzēst šo ierakstu');
        }

        if ($post->group_id !== $group->id) {
            return back()->with('error', 'Ieraksts nav no šīs grupas');
        }

        $postId = $post->id;


        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();


        broadcast(new GroupPostDeleted($postId, $group->id))->toOthers();

        return back()->with('success', 'Ieraksts dzēsts');
    }


    public function events(Group $group)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Tikai grupas dalībnieki var redzēt pasākumus');
        }

        $upcomingEvents = $group->events()
            ->where('event_date', '>=', now())
            ->where('status', 'upcoming')
            ->with(['creator', 'city'])
            ->withCount('confirmedParticipants')
            ->orderBy('event_date')
            ->get()
            ->map(function($event) use ($user) {
                $event->is_participating = $event->isParticipating($user);
                return $event;
            });

        $pastEvents = $group->events()
            ->where('event_date', '<', now())
            ->with(['creator', 'city'])
            ->withCount('confirmedParticipants')
            ->orderBy('event_date', 'desc')
            ->limit(10)
            ->get();

        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Groups/Events', [
            'user' => $user,
            'group' => $group,
            'upcomingEvents' => $upcomingEvents,
            'pastEvents' => $pastEvents,
            'is_admin' => $group->isAdmin($user),
            'cities' => $cities,
        ]);
    }


    public function createEvent(Group $group)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Tikai grupas dalībnieki var izveidot pasākumus');
        }
        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Groups/CreateEvent', [
            'user' => $user,
            'group' => $group,
            'cities' => $cities
        ]);
    }


    public function storeEvent(Request $request, Group $group)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Tikai grupas dalībnieki var izveidot pasākumus');
        }

        $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'city_id' => 'required|exists:cities,id',
            'event_date' => 'required|date|after:now',
            'duration' => 'nullable|numeric|min:0.5|max:12',
            'max_participants' => 'nullable|integer|min:2|max:200',
            'price' => 'nullable|numeric|min:0|max:999.99',
            'is_recurring' => 'boolean',
            'recurring_pattern' => 'nullable|string|in:weekly,monthly'
        ]);

        $event = GroupEvent::create([
            'group_id' => $group->id,
            'creator_id' => $user->id,
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'city_id' => $request->input('city_id'),
            'event_date' => $request->input('event_date'),
            'duration' => $request->input('duration'),
            'max_participants' => $request->input('max_participants'),
            'price' => $request->input('price'),
            'is_recurring' => $request->input('is_recurring', false),
            'recurring_pattern' => $request->input('recurring_pattern'),
            'status' => 'upcoming'
        ]);

        NotificationService::groupEventCreated($event, $group, $user->id);


        $event->addParticipant($user, 'going');

        return redirect()->route('groups.events.show', [$group, $event])
            ->with('success', 'Pasākums veiksmīgi izveidots!');
    }


    public function showEvent(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Tikai grupas dalībnieki var redzēt pasākumu detaļas');
        }

        if ($event->group_id !== $group->id) {
            return back()->with('error', 'Pasākums nav no šīs grupas');
        }

        $event->load(['creator', 'confirmedParticipants.profile', 'city']);
        $event->loadCount('confirmedParticipants');

        $cities = \App\Models\City::orderBy('population', 'desc')->get(['id', 'name', 'region']);


        $event->is_participating = $event->isParticipating($user);
        $event->is_creator = $event->creator_id === $user->id;
        $event->can_edit = $event->creator_id === $user->id || $group->isAdmin($user);


        $event->average_rating = $event->average_rating;
        $event->total_feedback = $event->feedback()->count();
        $event->recommendation_percentage = $event->recommendation_percentage;
        $event->user_has_feedback = $event->hasUserFeedback($user);

        $participants = $event->confirmedParticipants->map(function($participant) {
            if ($participant->profile) {
                $mainPhoto = UserProfilePhoto::where('user_profile_id', $participant->profile->id)
                    ->where('is_main', true)
                    ->first();
                if ($mainPhoto) {
                    $participant->profile->main_photo = '/storage/' . $mainPhoto->photo_path;
                }
            }
            return $participant;
        });

        return Inertia::render('Groups/EventShow', [
            'user' => $user,
            'group' => $group,
            'event' => $event,
            'participants' => $participants,
            'cities' => $cities
        ]);
    }


    public function joinEvent(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($event->group_id !== $group->id) {
            return back()->with('error', 'Pasākums nav no šīs grupas');
        }

        if ($event->isParticipating($user)) {
            return back()->with('error', 'Jūs jau piedalāties šajā pasākumā');
        }

        if ($event->isFull()) {
            return back()->with('error', 'Pasākums ir pilns');
        }

        $event->addParticipant($user, 'going');

        return back()->with('success', 'Veiksmīgi pieteicāties pasākumam!');
    }


    public function leaveEvent(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($event->group_id !== $group->id) {
            return back()->with('error', 'Pasākums nav no šīs grupas');
        }

        if ($event->creator_id === $user->id) {
            return back()->with('error', 'Pasākuma izveidotājs nevar pamest pasākumu');
        }

        if (!$event->isParticipating($user)) {
            return back()->with('error', 'Jūs nepiedalāties šajā pasākumā');
        }

        $event->removeParticipant($user);

        return back()->with('success', 'Jūs vairs nepiedalāties pasākumā');
    }

    public function editEvent(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($event->creator_id !== $user->id && !$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību rediģēt šo pasākumu');
        }

        $event->loadCount('confirmedParticipants');
        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Groups/EditEvent', [
            'user' => $user,
            'group' => $group,
            'event' => $event,
            'cities' => $cities
        ]);
    }



    public function updateEvent(Request $request, Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($event->creator_id !== $user->id && !$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību rediģēt šo pasākumu');
        }

        if ($event->group_id !== $group->id) {
            return back()->with('error', 'Pasākums nav no šīs grupas');
        }

        $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string|max:1000',
            'city_id' => 'required|exists:cities,id',
            'event_date' => 'required|date|after:now',
            'duration' => 'nullable|numeric|min:0.5|max:12',
            'max_participants' => 'nullable|integer|min:2|max:200',
            'price' => 'nullable|numeric|min:0|max:999.99',
            'is_recurring' => 'boolean',
            'recurring_pattern' => 'nullable|string|in:weekly,monthly'
        ]);

        $event->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'city_id' => $request->input('city_id'),
            'event_date' => $request->input('event_date'),
            'duration' => $request->input('duration'),
            'max_participants' => $request->input('max_participants'),
            'price' => $request->input('price')
        ]);

        return redirect()->route('groups.events.show', [$group, $event])
            ->with('success', 'Pasākums atjaunināts');
    }



    public function destroyEvent(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        if (!$group->isMember($user)) {
            return back()->with('error', 'Nav tiesību');
        }

        if ($event->creator_id !== $user->id && !$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību dzēst šo pasākumu');
        }

        if ($event->group_id !== $group->id) {
            return back()->with('error', 'Pasākums nav no šīs grupas');
        }

        $event->delete();

        return redirect()->route('groups.events', $group)
            ->with('success', 'Pasākums dzēsts');
    }
    public function settings(Group $group)
    {
        $user = Auth::user();

        if (!$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību piekļūt grupas iestatījumiem');
        }

        $group->load(['creator', 'sports']);
        $sports = Sport::where('is_active', true)->get();

        $memberStats = [
            'total_members' => $group->approvedMembers()->count(),
            'pending_members' => $group->pendingMembers()->count(),
            'total_posts' => $group->posts()->count(),
            'total_events' => $group->events()->count(),
            'upcoming_events' => $group->upcomingEvents()->count(),
        ];

        $cities = City::orderBy('population', 'desc')->get(['id', 'name', 'region']);

        return Inertia::render('Groups/Settings', [
            'user' => $user,
            'group' => $group,
            'sports' => $sports,
            'cities' => $cities,  // Add this
            'memberStats' => $memberStats
        ]);
    }


    public function update(Request $request, Group $group)
    {
        $user = Auth::user();

        if (!$group->isAdmin($user)) {
            return back()->with('error', 'Nav tiesību rediģēt grupu');
        }

        $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'city_id' => 'required|exists:cities,id',
            'max_members' => 'nullable|integer|min:' . $group->approvedMembers()->count() . '|max:500',
            'is_private' => 'boolean',
            'sports' => 'required|array|min:1',
            'sports.*.id' => 'required|exists:sports,id',
            'sports.*.skill_level' => 'required|in:beginner,intermediate,advanced,all',
            'cover_photo' => 'nullable|image|max:5120'
        ]);


        $group->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'city_id' => $request->input('city_id'),
            'max_members' => $request->input('max_members'),
            'is_private' => $request->input('is_private', false)
        ]);


        if ($request->hasFile('cover_photo')) {
            if ($group->cover_photo) {
                Storage::disk('public')->delete($group->cover_photo);
            }

            $path = $request->file('cover_photo')->store('group-covers', 'public');
            $group->update(['cover_photo' => $path]);
        }

        $group->sports()->detach();
        foreach ($request->input('sports') as $sport) {
            $group->sports()->attach($sport['id'], [
                'skill_level' => $sport['skill_level']
            ]);
        }

        return back()->with('success', 'Grupas iestatījumi atjaunināti!');
    }


    public function destroy(Group $group)
    {
        $user = Auth::user();

        if ($group->creator_id !== $user->id) {
            return back()->with('error', 'Tikai grupas izveidotājs var dzēst grupu');
        }

        if ($group->cover_photo) {
            Storage::disk('public')->delete($group->cover_photo);
        }

        $posts = $group->posts()->whereNotNull('image')->get();
        foreach ($posts as $post) {
            Storage::disk('public')->delete($post->image);
        }

        $group->delete();

        return redirect()->route('groups.index')
            ->with('success', 'Grupa dzēsta');
    }
}
