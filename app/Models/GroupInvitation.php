<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'invited_by',
        'invited_user',
        'status',
        'responded_at'
    ];

    protected $casts = [
        'responded_at' => 'datetime'
    ];

    /**
     * Get the group this invitation belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the user who sent the invitation.
     */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    /**
     * Get the user who was invited.
     */
    public function invitee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_user');
    }

    /**
     * Accept the invitation.
     */
    public function accept(): void
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now()
        ]);

        // Add user to group
        $this->group->addMember($this->invitee, 'approved');
    }

    /**
     * Decline the invitation.
     */
    public function decline(): void
    {
        $this->update([
            'status' => 'declined',
            'responded_at' => now()
        ]);
    }

    /**
     * Check if invitation is still pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if invitation was accepted.
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if invitation was declined.
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }

    /**
     * Scope for pending invitations.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for a specific user's invitations.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('invited_user', $userId);
    }
}
