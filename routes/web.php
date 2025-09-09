<?php

use App\Http\Controllers\ProfileSetupController;
use App\Http\Controllers\PartnerSearchController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Profile Setup Routes
Route::middleware('auth')->prefix('profile/setup')->name('profile.setup.')->group(function () {
    Route::get('/step-1', [ProfileSetupController::class, 'step1'])->name('step1');
    Route::post('/step-1', [ProfileSetupController::class, 'storeStep1'])->name('step1.store');

    Route::get('/step-2', [ProfileSetupController::class, 'step2'])->name('step2');
    Route::post('/step-2', [ProfileSetupController::class, 'storeStep2'])->name('step2.store');

    Route::get('/step-3', [ProfileSetupController::class, 'step3'])->name('step3');
    Route::post('/step-3', [ProfileSetupController::class, 'storeStep3'])->name('step3.store');

    Route::get('/step-4', [ProfileSetupController::class, 'step4'])->name('step4');
    Route::post('/step-4', [ProfileSetupController::class, 'storeStep4'])->name('step4.store');
});

// Main app routes - require complete profile
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard', [
            'user' => Auth::user(),
        ]);
    })->name('dashboard');

    // Partner Search
    Route::get('/partners', [PartnerSearchController::class, 'index'])->name('partners.index');

    // Friend Requests
    Route::post('/friends/{user}/request', [PartnerSearchController::class, 'sendFriendRequest'])->name('friends.request');
    Route::post('/friends/{user}/accept', [PartnerSearchController::class, 'acceptFriendRequest'])->name('friends.accept');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
