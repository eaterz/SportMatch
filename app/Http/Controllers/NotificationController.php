<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{

    public function index()
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $notifications->through(function ($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'data' => $notification->data,
                'message' => $notification->getMessage(),
                'icon' => $notification->getIcon(),
                'action_url' => $notification->getActionUrl(),
                'is_read' => $notification->isRead(),
                'created_at' => $notification->created_at->diffForHumans()
            ];
        });

        return Inertia::render('Notifications/Index', [
            'user' => $user, // ADD THIS LINE - This was missing!
            'notifications' => $notifications,
            'unread_count' => $user->unread_notifications_count
        ]);
    }


    public function recent()
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'message' => $notification->getMessage(),
                    'icon' => $notification->getIcon(),
                    'action_url' => $notification->getActionUrl(),
                    'is_read' => $notification->isRead(),
                    'created_at' => $notification->created_at->diffForHumans()
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unread_notifications_count
        ]);
    }


    public function markAsRead($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json(['success' => true]);
    }


    public function markAllAsRead()
    {
        $user = Auth::user();
        $user->notifications()->unread()->update(['read_at' => now()]);

        return back()->with('success', 'Visi paziņojumi atzīmēti kā lasīti');
    }


    public function destroy($id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->delete();
        }

        return back()->with('success', 'Paziņojums dzēsts');
    }

    public function unreadCount()
    {
        $user = Auth::user();

        return response()->json([
            'count' => $user->unread_notifications_count
        ]);
    }
}
