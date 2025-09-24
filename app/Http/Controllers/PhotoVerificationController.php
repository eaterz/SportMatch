<?php

namespace App\Http\Controllers;

use App\Models\PhotoVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\Facades\Image;

class PhotoVerificationController extends Controller
{
    /**
     * Show verification page
     */
    public function index()
    {
        $user = Auth::user();

        // Check if already verified
        if ($user->profile?->is_verified) {
            return Inertia::render('Verification/AlreadyVerified', [
                'verificationStatus' => $user->profile->verification_status
            ]);
        }

        // Check for pending request
        $pendingRequest = PhotoVerificationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($pendingRequest) {
            return Inertia::render('Verification/Pending', [
                'request' => $pendingRequest
            ]);
        }

        // Get rejected requests
        $rejectedRequests = PhotoVerificationRequest::where('user_id', $user->id)
            ->where('status', 'rejected')
            ->latest()
            ->limit(3)
            ->get();

        return Inertia::render('Verification/Start', [
            'user' => $user->load('profile'),
            'rejectedRequests' => $rejectedRequests
        ]);
    }

    /**
     * Start verification process
     */
    public function start()
    {
        $user = Auth::user();

        // Check if can create new request
        $lastRequest = PhotoVerificationRequest::where('user_id', $user->id)
            ->latest()
            ->first();

        if ($lastRequest && $lastRequest->status === 'pending' && !$lastRequest->isExpired()) {
            return redirect()->route('verification.index');
        }

        // Generate new verification code
        $verificationCode = strtoupper(\Str::random(6));

        return Inertia::render('Verification/Process', [
            'verificationCode' => $verificationCode,
            'user' => $user
        ]);
    }

    /**
     * Submit verification photos
     */
    public function submit(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'selfie' => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'id_document' => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'selfie_with_id' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
            'verification_code' => 'required|string|size:6'
        ]);

        // Store photos securely
        $selfiePath = $this->storeVerificationPhoto($request->file('selfie'), 'selfie', $user->id);
        $idPath = $this->storeVerificationPhoto($request->file('id_document'), 'id', $user->id);
        $selfieWithIdPath = null;

        if ($request->hasFile('selfie_with_id')) {
            $selfieWithIdPath = $this->storeVerificationPhoto(
                $request->file('selfie_with_id'),
                'selfie-id',
                $user->id
            );
        }

        // Create verification request
        PhotoVerificationRequest::create([
            'user_id' => $user->id,
            'selfie_photo' => $selfiePath,
            'id_document_photo' => $idPath,
            'selfie_with_id_photo' => $selfieWithIdPath,
            'verification_code' => $request->verification_code,
            'metadata' => [
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'submitted_at' => now()->toIso8601String()
            ]
        ]);

        return redirect()->route('verification.success');
    }

    /**
     * Store verification photo with processing
     */
    private function storeVerificationPhoto($file, $type, $userId)
    {
        // Create unique filename
        $filename = sprintf(
            '%s_%s_%s.%s',
            $userId,
            $type,
            now()->timestamp,
            $file->getClientOriginalExtension()
        );

        // Process image (resize, remove metadata)
        $image = Image::make($file);

        // Remove EXIF data for privacy
        $image->orientate();

        // Resize if too large (max 1500px on longest side)
        $image->resize(1500, 1500, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });

        // Save to secure storage
        $path = 'verification/' . $userId . '/' . $filename;
        Storage::disk('private')->put($path, $image->encode());

        return $path;
    }

    /**
     * Show success page
     */
    public function success()
    {
        return Inertia::render('Verification/Success');
    }

    /**
     * Cancel pending request
     */
    public function cancel()
    {
        $user = Auth::user();

        $pendingRequest = PhotoVerificationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingRequest) {
            // Delete photos
            Storage::disk('private')->delete([
                $pendingRequest->selfie_photo,
                $pendingRequest->id_document_photo,
                $pendingRequest->selfie_with_id_photo
            ]);

            $pendingRequest->delete();
        }

        return redirect()->route('verification.index')
            ->with('success', 'Verifikācijas pieprasījums atcelts');
    }
}
