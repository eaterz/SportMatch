<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;


class VerifyPendingEmail extends Notification
{
    public function __construct(public \App\Models\User $user) {}

    public function toMail($notifiable): MailMessage
    {
        $url = URL::temporarySignedRoute(
            'profile.email.verify',
            Carbon::now()->addMinutes(60),
            ['user' => $this->user->id]
        );

        return (new MailMessage)
            ->subject('Apstipriniet jauno e-pasta adresi')
            ->line('Jūs lūdzāt mainīt e-pasta adresi uz: ' . $this->user->pending_email)
            ->action('Apstiprināt e-pastu', $url)
            ->line('Šī saite būs derīga 60 minūtes.')
            ->line('Ja jūs to nelūdzāt, ignorējiet šo e-pastu.');
    }
}
