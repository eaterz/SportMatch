<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PhotoVerificationRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class VerificationReviewController extends Controller
{
    /**
     * Display list of pending verification requests
     */
    public function index(Request $request)
    {
        $query = PhotoVerificationRequest::with(['user.profile']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            // Default to pending
            $query->where('status', 'pending');
        }

        // Search by user name or email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('lastname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->orderBy('created_at', 'asc')
            ->paginate(20);

        // Get statistics
        $stats = [
            'pending' => PhotoVerificationRequest::where('status', 'pending')->count(),
            'approved' => PhotoVerificationRequest::where('status', 'approved')
                ->whereMonth('created_at', now()->month)
                ->count(),
            'rejected' => PhotoVerificationRequest::where('status', 'rejected')
                ->whereMonth('created_at', now()->month)
                ->count(),
            'total_verified' => User::whereHas('profile', function($q) {
                $q->where('is_verified', true);
            })->count()
        ];

        return Inertia::render('Admin/Verification/Index', [
            'requests' => $requests,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    /**
     * Show single verification request for review
     */
    public function show(PhotoVerificationRequest $request)
    {
        $request->load(['user.profile', 'reviewer']);

        // Get user's previous verification attempts
        $previousAttempts = PhotoVerificationRequest::where('user_id', $request->user_id)
            ->where('id', '!=', $request->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get secure photo URLs using custom route
        $photos = [
            'selfie' => $request->selfie_photo
                ? route('admin.verification.photo', ['request' => $request->id, 'type' => 'selfie'])
                : null,
            'id_document' => $request->id_document_photo
                ? route('admin.verification.photo', ['request' => $request->id, 'type' => 'id_document'])
                : null,
            'selfie_with_id' => $request->selfie_with_id_photo
                ? route('admin.verification.photo', ['request' => $request->id, 'type' => 'selfie_with_id'])
                : null
        ];

        return Inertia::render('Admin/Verification/Show', [
            'verificationRequest' => $request,
            'photos' => $photos,
            'previousAttempts' => $previousAttempts,
            'user' => $request->user
        ]);
    }

    /**
     * Serve verification photos securely
     */
    public function servePhoto(PhotoVerificationRequest $request, string $type)
    {
        // Check if user has permission to view verification photos
        if (!Auth::user() || !Auth::user()->is_admin) {
            abort(403);
        }

        // Get the photo path based on type
        $photoPath = match($type) {
            'selfie' => $request->selfie_photo,
            'id_document' => $request->id_document_photo,
            'selfie_with_id' => $request->selfie_with_id_photo,
            default => null
        };

        if (!$photoPath || !Storage::disk('private')->exists($photoPath)) {
            abort(404);
        }

        // Get file contents and mime type
        $file = Storage::disk('private')->get($photoPath);
        $mimeType = Storage::disk('private')->mimeType($photoPath);

        // Return the file with appropriate headers
        return response($file, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }

    /**
     * Approve verification request
     */
    public function approve(Request $request, PhotoVerificationRequest $verificationRequest)
    {
        if ($verificationRequest->status !== 'pending') {
            return back()->with('error', 'Šis pieprasījums jau ir apstrādāts');
        }

        // Approve the request
        $verificationRequest->approve(Auth::id());

        // Send notification to user
        NotificationService::verificationApproved($verificationRequest->user);

        // Clean up old verification photos after approval
        $this->schedulePhotoCleanup($verificationRequest);

        return redirect()->route('admin.verification.index')
            ->with('success', 'Verifikācija apstiprināta veiksmīgi!');
    }

    /**
     * Reject verification request
     */
    public function reject(Request $request, PhotoVerificationRequest $verificationRequest)
    {
        if ($verificationRequest->status !== 'pending') {
            return back()->with('error', 'Šis pieprasījums jau ir apstrādāts');
        }

        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        // Reject the request
        $verificationRequest->reject($request->reason, Auth::id());

        // Send notification to user
        NotificationService::verificationRejected($verificationRequest->user, $request->reason);

        // Clean up photos immediately for rejected requests
        $this->cleanupPhotos($verificationRequest);

        return redirect()->route('admin.verification.index')
            ->with('success', 'Verifikācija noraidīta');
    }

    /**
     * Schedule photo cleanup after approval
     */
    private function schedulePhotoCleanup(PhotoVerificationRequest $request)
    {
        // In production, you'd use a job queue for this
        // For now, we'll just mark for cleanup
        $request->update([
            'metadata' => array_merge($request->metadata ?? [], [
                'cleanup_scheduled' => now()->addDays(7)->toIso8601String()
            ])
        ]);
    }

    /**
     * Clean up verification photos
     */
    private function cleanupPhotos(PhotoVerificationRequest $request)
    {
        $photos = [
            $request->selfie_photo,
            $request->id_document_photo,
            $request->selfie_with_id_photo
        ];

        foreach ($photos as $photo) {
            if ($photo && Storage::disk('private')->exists($photo)) {
                Storage::disk('private')->delete($photo);
            }
        }
    }

    /**
     * Bulk approve verification requests
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:photo_verification_requests,id'
        ]);

        $approved = 0;
        foreach ($request->ids as $id) {
            $verificationRequest = PhotoVerificationRequest::find($id);
            if ($verificationRequest->status === 'pending') {
                $verificationRequest->approve(Auth::id());
                NotificationService::verificationApproved($verificationRequest->user);
                $approved++;
            }
        }

        return back()->with('success', "Apstiprinātas {$approved} verifikācijas");
    }

    /**
     * Dashboard with statistics
     */
    public function dashboard()
    {
        $stats = [
            'pending_count' => PhotoVerificationRequest::where('status', 'pending')->count(),
            'today_pending' => PhotoVerificationRequest::where('status', 'pending')
                ->whereDate('created_at', today())
                ->count(),
            'this_week_processed' => PhotoVerificationRequest::whereIn('status', ['approved', 'rejected'])
                ->where('reviewed_at', '>=', now()->startOfWeek())
                ->count(),
            'approval_rate' => $this->calculateApprovalRate(),
            'average_review_time' => $this->calculateAverageReviewTime(),
            'verified_users_total' => User::whereHas('profile', function($q) {
                $q->where('is_verified', true);
            })->count()
        ];

        $recentRequests = PhotoVerificationRequest::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Verification/Dashboard', [
            'stats' => $stats,
            'recentRequests' => $recentRequests
        ]);
    }

    private function calculateApprovalRate()
    {
        $total = PhotoVerificationRequest::whereIn('status', ['approved', 'rejected'])
            ->whereMonth('created_at', now()->month)
            ->count();

        if ($total === 0) return 0;

        $approved = PhotoVerificationRequest::where('status', 'approved')
            ->whereMonth('created_at', now()->month)
            ->count();

        return round(($approved / $total) * 100);
    }

    /**
     * Calculate average review time in hours (database-agnostic)
     */
    private function calculateAverageReviewTime()
    {
        // Get all reviewed requests from this month
        $requests = PhotoVerificationRequest::whereNotNull('reviewed_at')
            ->whereMonth('created_at', now()->month)
            ->select('created_at', 'reviewed_at')
            ->get();

        if ($requests->isEmpty()) {
            return 0;
        }

        // Calculate total hours using Carbon
        $totalHours = $requests->sum(function ($request) {
            return $request->created_at->diffInHours($request->reviewed_at);
        });

        return round($totalHours / $requests->count());
    }
}
