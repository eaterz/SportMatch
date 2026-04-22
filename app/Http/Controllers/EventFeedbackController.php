<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupEvent;
use App\Models\GroupEventFeedback;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EventFeedbackController extends Controller
{
    /**
     * Show feedback form for an event
     */
    public function create(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        // Check if user can leave feedback
        if (!$event->canLeaveFeedback($user)) {
            return redirect()->route('groups.events.show', [$group, $event])
                ->with('error', 'Jūs nevarat atstāt atsauksmi par šo pasākumu');
        }

        return Inertia::render('Groups/EventFeedback', [
            'user' => $user,
            'group' => $group,
            'event' => $event->load(['creator', 'city'])
        ]);
    }

    /**
     * Store feedback
     */
    public function store(Request $request, Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        // Check if user can leave feedback
        if (!$event->canLeaveFeedback($user)) {
            return back()->with('error', 'Jūs nevarat atstāt atsauksmi par šo pasākumu');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'would_recommend' => 'required|boolean',
            'organization_rating' => 'nullable|in:poor,fair,good,excellent',
            'location_rating' => 'nullable|in:poor,fair,good,excellent',
            'value_rating' => 'nullable|in:poor,fair,good,excellent'
        ]);

        $feedback = GroupEventFeedback::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'would_recommend' => $request->would_recommend,
            'organization_rating' => $request->organization_rating,
            'location_rating' => $request->location_rating,
            'value_rating' => $request->value_rating
        ]);

        // Notify event creator about new feedback
        if ($event->creator_id !== $user->id) {
            NotificationService::eventFeedbackReceived($event, $feedback);
        }

        return redirect()->route('groups.events.show', [$group, $event])
            ->with('success', 'Paldies par jūsu atsauksmi!');
    }

    /**
     * Show all feedback for an event
     */
    public function index(Group $group, GroupEvent $event)
    {
        $user = Auth::user();

        // Check if user is group member
        if (!$group->isMember($user)) {
            return redirect()->route('groups.show', $group)
                ->with('error', 'Tikai grupas dalībnieki var redzēt atsauksmes');
        }

        $feedback = $event->feedback()
            ->with('user.profile')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Calculate statistics
        $stats = [
            'total_feedback' => $event->feedback()->count(),
            'average_rating' => $event->average_rating,
            'recommendation_percentage' => $event->recommendation_percentage,
            'rating_distribution' => $this->getRatingDistribution($event),
            'category_averages' => $this->getCategoryAverages($event)
        ];

        return Inertia::render('Groups/EventFeedbackList', [
            'user' => $user,
            'group' => $group,
            'event' => $event->load(['creator', 'city']),
            'feedback' => $feedback,
            'stats' => $stats,
            'userFeedback' => $event->feedback()->where('user_id', $user->id)->first()
        ]);
    }

    /**
     * Update feedback
     */
    public function update(Request $request, Group $group, GroupEvent $event, GroupEventFeedback $feedback)
    {
        $user = Auth::user();

        // Check if this is user's feedback
        if ($feedback->user_id !== $user->id) {
            return back()->with('error', 'Nav atļauts rediģēt citu atsauksmes');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'would_recommend' => 'required|boolean',
            'organization_rating' => 'nullable|in:poor,fair,good,excellent',
            'location_rating' => 'nullable|in:poor,fair,good,excellent',
            'value_rating' => 'nullable|in:poor,fair,good,excellent'
        ]);

        $feedback->update($request->only([
            'rating', 'comment', 'would_recommend',
            'organization_rating', 'location_rating', 'value_rating'
        ]));

        return back()->with('success', 'Atsauksme atjaunināta!');
    }

    /**
     * Delete feedback
     */
    public function destroy(Group $group, GroupEvent $event, GroupEventFeedback $feedback)
    {
        $user = Auth::user();

        // Check if this is user's feedback or user is admin
        if ($feedback->user_id !== $user->id && !$group->isAdmin($user)) {
            return back()->with('error', 'Nav atļauts dzēst šo atsauksmi');
        }

        $feedback->delete();

        return back()->with('success', 'Atsauksme dzēsta');
    }

    /**
     * Get rating distribution
     */
    private function getRatingDistribution(GroupEvent $event): array
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = $event->feedback()->where('rating', $i)->count();
            $distribution[$i] = $count;
        }
        return $distribution;
    }

    /**
     * Get category averages
     */
    private function getCategoryAverages(GroupEvent $event): array
    {
        $categories = ['organization', 'location', 'value'];
        $averages = [];

        foreach ($categories as $category) {
            $field = $category . '_rating';
            $ratings = $event->feedback()
                ->whereNotNull($field)
                ->pluck($field)
                ->map(function($rating) {
                    return match($rating) {
                        'poor' => 1,
                        'fair' => 2,
                        'good' => 3,
                        'excellent' => 4,
                        default => 0
                    };
                });

            if ($ratings->count() > 0) {
                $averages[$category] = round($ratings->avg(), 1);
            } else {
                $averages[$category] = null;
            }
        }

        return $averages;
    }

    /**
     * Send feedback reminders (can be called via cron job)
     */
    public function sendReminders()
    {
        // Get events that ended 1 day ago
        $events = GroupEvent::where('event_date', '>=', now()->subDays(2))
            ->where('event_date', '<', now()->subDay())
            ->where('status', 'upcoming')
            ->get();

        foreach ($events as $event) {
            $participants = $event->confirmedParticipants()
                ->whereDoesntHave('eventFeedback', function($q) use ($event) {
                    $q->where('event_id', $event->id);
                })
                ->get();

            foreach ($participants as $participant) {
                NotificationService::eventFeedbackReminder($event, $participant);
            }
        }

        return response()->json(['message' => 'Reminders sent']);
    }
}
