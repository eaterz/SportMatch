<?php

use App\Http\Controllers\Admin\VerificationReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {

    // Admin Dashboard
    Route::get('/', function () {
        return redirect()->route('admin.verification.dashboard');
    })->name('index');

    // Verification Management
    Route::prefix('verification')->name('verification.')->group(function () {
        Route::get('/', [VerificationReviewController::class, 'index'])->name('index');
        Route::get('/dashboard', [VerificationReviewController::class, 'dashboard'])->name('dashboard');
        Route::get('/{request}', [VerificationReviewController::class, 'show'])->name('show');
        Route::post('/{verificationRequest}/approve', [VerificationReviewController::class, 'approve'])->name('approve');
        Route::post('/{verificationRequest}/reject', [VerificationReviewController::class, 'reject'])->name('reject');
        Route::post('/bulk-approve', [VerificationReviewController::class, 'bulkApprove'])->name('bulk-approve');
        Route::get('/{request}/photo/{type}', [VerificationReviewController::class, 'servePhoto'])
            ->name('photo');

    });
});
