<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventFeedbackController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PhotoVerificationController;
use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PartnerSearchController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


//Welcome
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Google OAuth Routes
Route::controller(GoogleAuthController::class)
    ->prefix('auth/google')
    ->name('google.')
    ->group(function () {
        Route::get('/redirect', 'redirect')->name('redirect');
        Route::get('/callback', 'callback')->name('callback');
    });



// Profile Setup - Photo Routes (must come before step routes)
Route::middleware('auth')
    ->prefix('profile/setup')
    ->name('profile.setup.')
    ->controller(ProfileSetupController::class)
    ->group(function () {
        Route::post('/photo/upload', 'uploadSetupPhoto')->name('photo.upload');
        Route::delete('/photo/{photo}', 'deleteSetupPhoto')->name('photo.delete');
        Route::post('/photo/{photo}/main', 'setMainSetupPhoto')->name('photo.main');
    });

// Profile Setup - Step Routes (NO verified middleware - users need to complete profile first!)
Route::middleware('auth')
    ->prefix('profile/setup')
    ->name('profile.setup.')
    ->controller(ProfileSetupController::class)
    ->group(function () {
        Route::get('/step-1', 'step1')->name('step1');
        Route::post('/step-1', 'storeStep1')->name('step1.store');

        Route::get('/step-2', 'step2')->name('step2');
        Route::post('/step-2', 'storeStep2')->name('step2.store');

        Route::get('/step-3', 'step3')->name('step3');
        Route::post('/step-3', 'storeStep3')->name('step3.store');

        Route::get('/step-4', 'step4')->name('step4');
        Route::post('/step-4', 'storeStep4')->name('step4.store');

        Route::get('/step-5', 'step5')->name('step5');
        Route::post('/step-5', 'storeStep5')->name('step5.store');
    });

//Authenticated Routes (with verified and profile complete checks)
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {

    //Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    //Partner Search
    Route::controller(PartnerSearchController::class)
        ->prefix('partners')
        ->name('partners.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
        });

    //Friends
    Route::controller(FriendsController::class)
        ->prefix('friends')
        ->name('friends.')
        ->group(function () {
            // Main page
            Route::get('/', 'index')->name('index');

            // Friend request actions
            Route::post('/request/{receiver}', [PartnerSearchController::class, 'sendFriendRequest'])->name('request');
            Route::post('/accept/{sender}', 'acceptRequest')->name('accept');
            Route::post('/reject/{sender}', 'rejectRequest')->name('reject');
            Route::post('/cancel/{receiver}', 'cancelRequest')->name('cancel');

            // Remove friend
            Route::post('/remove/{friend}', 'removeFriend')->name('remove');
        });

    //Chat
    Route::controller(ChatController::class)
        ->prefix('chat')
        ->name('chat.')
        ->group(function () {
            Route::get('/{friend?}', 'index')->name('index');
            Route::post('/{friend}/send', 'sendMessage')->name('send');
            Route::post('/{friend}/read', 'markAsRead')->name('read');
            Route::get('/{friend}/messages', 'getMessages')->name('messages');
        });

    //Profile
    Route::controller(ProfileController::class)
        ->prefix('profile')
        ->name('profile.')
        ->group(function () {
            // View & Update
            Route::get('/', 'show')->name('show');
            Route::post('/bio', 'updateBio')->name('bio');
            Route::post('/update', 'update')->name('update');

            // Photo management
            Route::prefix('photo')->name('photo.')->group(function () {
                Route::post('/', 'uploadPhoto')->name('upload');
                Route::post('/{photo}/main', 'setMainPhoto')->name('main');
                Route::delete('/{photo}', 'deletePhoto')->name('delete');
            });
        });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/recent', [NotificationController::class, 'recent'])->name('notifications.recent');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/delete-all', [NotificationController::class, 'deleteAll'])->name('notifications.deleteAll');

    Route::controller(GroupsController::class)
        ->prefix('groups')
        ->name('groups.')
        ->group(function () {
            // Main routes
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');

            // Specific group
            Route::get('/{group}', 'show')->name('show');
            Route::post('/{group}/join', 'join')->name('join');
            Route::post('/{group}/leave', 'leave')->name('leave');

            // Members
            Route::get('/{group}/members', 'members')->name('members');
            Route::post('/{group}/members/{member}/approve', 'approveMember')->name('members.approve');
            Route::post('/{group}/members/{member}', 'removeMember')->name('members.remove');

            // Posts
            Route::post('/{group}/posts', 'createPost')->name('posts.create');
            Route::delete('/{group}/posts/{post}', 'deletePost')->name('posts.delete');
            Route::post('/{group}/posts/{post}/like', 'togglePostLike')->name('posts.like');
            Route::post('/{group}/posts/{post}/comment', 'addComment')->name('posts.comment');

            // Events
            Route::get('/{group}/events', 'events')->name('events');
            Route::get('/{group}/events/create', 'createEvent')->name('events.create');
            Route::post('/{group}/events', 'storeEvent')->name('events.store');
            Route::get('/{group}/events/{event}', 'showEvent')->name('events.show');
            Route::post('/{group}/events/{event}/join', 'joinEvent')->name('events.join');
            Route::post('/{group}/events/{event}/leave', 'leaveEvent')->name('events.leave');
            Route::put('/{group}/events/{event}', 'updateEvent')->name('events.update');
            Route::get('/{group}/events/{event}/edit', 'editEvent')->name('events.edit');
            Route::delete('/{group}/events/{event}', 'destroyEvent')->name('events.destroy');

            // Event Feedback Routes
            Route::get('/{group}/events/{event}/feedback', [EventFeedbackController::class, 'index'])->name('events.feedback.index');
            Route::get('/{group}/events/{event}/feedback/create', [EventFeedbackController::class, 'create'])->name('events.feedback.create');
            Route::post('/{group}/events/{event}/feedback', [EventFeedbackController::class, 'store'])->name('events.feedback.store');
            Route::put('/{group}/events/{event}/feedback/{feedback}', [EventFeedbackController::class, 'update'])->name('events.feedback.update');
            Route::delete('/{group}/events/{event}/feedback/{feedback}', [EventFeedbackController::class, 'destroy'])->name('events.feedback.destroy');

            // Administration
            Route::get('/{group}/settings', 'settings')->name('settings');
            Route::put('/{group}', 'update')->name('update');
            Route::post('/{group}', 'destroy')->name('destroy');
        });

    // Photo Verification
    Route::controller(\App\Http\Controllers\PhotoVerificationController::class)
        ->prefix('verification')
        ->name('verification.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/start', 'start')->name('start');
            Route::post('/submit', 'submit')->name('submit');
            Route::get('/success', 'success')->name('success');
            Route::get('/pending', 'pending')->name('pending');
            Route::post('/cancel', 'cancel')->name('cancel');
        });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
