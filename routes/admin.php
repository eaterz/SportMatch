<?php

use App\Http\Controllers\Admin\VerificationReviewController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Novirza uz dashboard
        Route::get('/', fn() => redirect()->route('admin.verification.dashboard'))
            ->name('index');

        Route::prefix('verification')
            ->name('verification.')
            ->group(function () {
                // Statiskie routes VIENMĒR pirms dinamiskajiem
                Route::get('/',          [VerificationReviewController::class, 'index'])->name('index');
                Route::get('/dashboard', [VerificationReviewController::class, 'dashboard'])->name('dashboard');
                Route::post('/bulk-approve', [VerificationReviewController::class, 'bulkApprove'])->name('bulk-approve');

                // Dinamiskie routes — pēdējie
                Route::post('/{verificationRequest}/approve', [VerificationReviewController::class, 'approve'])->name('approve');
                Route::post('/{verificationRequest}/reject',  [VerificationReviewController::class, 'reject'])->name('reject');
                Route::get('/{request}/photo/{type}',         [VerificationReviewController::class, 'servePhoto'])->name('photo');
                Route::get('/{request}',                      [VerificationReviewController::class, 'show'])->name('show');
            });
    });
