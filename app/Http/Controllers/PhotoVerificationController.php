<?php

namespace App\Http\Controllers;

use App\Models\PhotoVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
            return redirect()->route('profile.show')
                ->with('success', 'Tavs profils jau ir verificēts!');
        }

        // Check for pending request
        $pendingRequest = PhotoVerificationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();

        if ($pendingRequest) {
            return redirect()->route('profile.show')
                ->with('info', 'Tava verifikācijas pieprasījums jau tiek apstrādāts.');
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

        // Check if already verified
        if ($user->profile?->is_verified) {
            return redirect()->route('profile.show');
        }

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

        // Check if already verified
        if ($user->profile?->is_verified) {
            return redirect()->route('profile.show')
                ->with('error', 'Tavs profils jau ir verificēts!');
        }

        $request->validate([
            'selfie' => 'required|image|mimes:jpg,jpeg,png|max:10240', // 10MB max
            'id_document' => 'required|image|mimes:jpg,jpeg,png|max:10240',
            'selfie_with_id' => 'nullable|image|mimes:jpg,jpeg,png|max:10240',
            'verification_code' => 'required|string|size:6'
        ]);

        try {
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
                'status' => 'pending',
                'expires_at' => now()->addHours(72), // 72 hour expiry
                'metadata' => [
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'submitted_at' => now()->toIso8601String(),
                    'file_sizes' => [
                        'selfie' => $request->file('selfie')->getSize(),
                        'id_document' => $request->file('id_document')->getSize(),
                        'selfie_with_id' => $request->hasFile('selfie_with_id') ? $request->file('selfie_with_id')->getSize() : null
                    ]
                ]
            ]);

            return redirect()->route('verification.success');

        } catch (\Exception $e) {
            \Log::error('Verification submission error', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors([
                'general' => 'Kļūda saglabājot fotogrāfijas. Lūdzu, mēģiniet vēlreiz.'
            ]);
        }
    }

    /**
     * Store verification photo securely
     */
    private function storeVerificationPhoto($file, $type, $userId)
    {
        // Create unique filename with timestamp
        $filename = sprintf(
            '%s_%s_%s_%s.%s',
            $userId,
            $type,
            now()->format('Y-m-d_H-i-s'),
            \Str::random(8),
            $file->getClientOriginalExtension()
        );

        // Create secure directory path
        $directory = 'verification/' . $userId . '/' . now()->format('Y-m');
        $path = $directory . '/' . $filename;

        // Ensure directory exists
        if (!Storage::disk('private')->exists($directory)) {
            Storage::disk('private')->makeDirectory($directory);
        }

        // Store the file securely
        Storage::disk('private')->putFileAs($directory, $file, $filename);

        return $path;
    }

    /**
     * Show success page
     */
    public function success()
    {
        return Inertia::render('Verification/Success', [
            'user' => Auth::user()
        ]);
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
            // Delete photos from storage
            $photoPaths = array_filter([
                $pendingRequest->selfie_photo,
                $pendingRequest->id_document_photo,
                $pendingRequest->selfie_with_id_photo
            ]);

            foreach ($photoPaths as $path) {
                if (Storage::disk('private')->exists($path)) {
                    Storage::disk('private')->delete($path);
                }
            }

            // Delete request
            $pendingRequest->delete();

            return redirect()->route('verification.index')
                ->with('success', 'Verifikācijas pieprasījums atcelts');
        }

        return redirect()->route('verification.index')
            ->with('error', 'Nav aktīva verifikācijas pieprasījuma');
    }

    /**
     * Show pending verification status
     */
    public function pending()
    {
        $user = Auth::user();

        $pendingRequest = PhotoVerificationRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if (!$pendingRequest) {
            return redirect()->route('verification.index');
        }

        return Inertia::render('Verification/Pending', [
            'user' => $user,
            'request' => $pendingRequest
        ]);
    }
}
