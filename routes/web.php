<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\FriendsController;
use App\Http\Controllers\GroupsController;
use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PartnerSearchController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');



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
    });


Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {



    Route::get('/dashboard', function () {
        return Inertia::render('dashboard', [
            'user' => Auth::user(),
        ]);
    })->name('dashboard');



    Route::controller(PartnerSearchController::class)
        ->prefix('partners')
        ->name('partners.')
        ->group(function () {
            Route::get('/', 'index')->name('index');
        });



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
            Route::delete('/remove/{friend}', 'removeFriend')->name('remove');
        });



    Route::controller(ChatController::class)
        ->prefix('chat')
        ->name('chat.')
        ->group(function () {
            Route::get('/{friend?}', 'index')->name('index');
            Route::post('/{friend}/send', 'sendMessage')->name('send');
            Route::post('/{friend}/read', 'markAsRead')->name('read');
            Route::get('/{friend}/messages', 'getMessages')->name('messages');
        });




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



    Route::controller(GroupsController::class)
        ->prefix('groups')
        ->name('groups.')
        ->group(function () {
            Route::get('/', 'search')->name('search');
            Route::post('/create', 'create')->name('create');
        });

    Route::controller(GroupsController::class)
        ->prefix('groups')
        ->name('groups.')
        ->group(function () {
            // Saraksts un meklēšana
            Route::get('/', 'index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');

            // Konkrēta grupa
            Route::get('/{group}', 'show')->name('show');
            Route::post('/{group}/join', 'join')->name('join');
            Route::post('/{group}/leave', 'leave')->name('leave');

            // Dalībnieki
            Route::get('/{group}/members', 'members')->name('members');
            Route::post('/{group}/members/{member}/approve', 'approveMember')->name('members.approve');
            Route::delete('/{group}/members/{member}', 'removeMember')->name('members.remove');

            // Ziņas (posts)
            Route::post('/{group}/posts', 'createPost')->name('posts.create');
            Route::delete('/{group}/posts/{post}', 'deletePost')->name('posts.delete');
            Route::post('/{group}/posts/{post}/like', 'toggleLike')->name('posts.like');
            Route::post('/{group}/posts/{post}/comment', 'addComment')->name('posts.comment');

            // Pasākumi
            Route::get('/{group}/events', 'events')->name('events');
            Route::get('/{group}/events/create', 'createEvent')->name('events.create');
            Route::post('/{group}/events', 'storeEvent')->name('events.store');
            Route::get('/{group}/events/{event}', 'showEvent')->name('events.show');
            Route::post('/{group}/events/{event}/join', 'joinEvent')->name('events.join');
            Route::post('/{group}/events/{event}/leave', 'leaveEvent')->name('events.leave');

            // Administrēšana
            Route::get('/{group}/settings', 'settings')->name('settings');
            Route::put('/{group}', 'update')->name('update');
            Route::delete('/{group}', 'destroy')->name('destroy');
        });

});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
