<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.settings.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.settings.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.settings.destroy');
    Route::get('/profile/email/verify/{user}', [ProfileController::class, 'verifyPendingEmail'])
        ->middleware(['signed'])
        ->name('profile.email.verify');

    Route::post('/profile/email/cancel', [ProfileController::class, 'cancelEmailChange'])
        ->middleware('auth')
        ->name('profile.email.cancel');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.settings.edit');



    Route::post('/verification/send', [ProfileController::class, 'sendVerification'])
        ->middleware(['auth', 'throttle:6,1'])
        ->name('settings.verification.send');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.settings.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
