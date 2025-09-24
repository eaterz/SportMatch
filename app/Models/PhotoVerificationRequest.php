<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PhotoVerificationRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'selfie_photo',
        'id_document_photo',
        'selfie_with_id_photo',
        'verification_code',
        'metadata',
        'reviewed_by',
        'reviewed_at',
        'rejection_reason',
        'expires_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'reviewed_at' => 'datetime',
        'expires_at' => 'datetime'
    ];

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Generate verification code
            $model->verification_code = strtoupper(Str::random(6));

            // Set expiration (24 hours)
            $model->expires_at = now()->addHours(24);
        });
    }

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the reviewer
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Check if expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Approve verification
     */
    public function approve($reviewerId = null): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now()
        ]);

        // Update user profile
        $this->user->profile->update([
            'is_verified' => true,
            'verified_at' => now(),
            'verification_method' => 'photo_id'
        ]);
    }

    /**
     * Reject verification
     */
    public function reject($reason, $reviewerId = null): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now()
        ]);
    }
}
