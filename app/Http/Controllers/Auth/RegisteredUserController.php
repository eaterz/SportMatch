<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{L}\s\-]+$/u',
            ],
            'lastname' => [
                'required',
                'string',
                'max:255',
                'regex:/^[\p{L}\s\-]+$/u',
            ],
            'email' => [
                'required',
                'string',
                'max:255',
                'lowercase',
                'email',
                Rules\Email::defaults()
                    ->rfcCompliant(strict: true)
                    ->validateMxRecord(),
                Rule::unique(User::class, 'email'),
            ],
            'password' => [
                'required',
                'confirmed',
                Rules\Password::defaults()
                    ->min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                'not_regex:/^(password|parole|123456|qwerty)/i',
            ],
        ], [
        'name.required'    => 'Vārds ir obligāts.',
        'name.regex'       => 'Vārdā drīkst būt tikai burti.',
        'lastname.required'=> 'Uzvārds ir obligāts.',
        'lastname.regex'   => 'Uzvārdā drīkst būt tikai burti.',
        'email.required'   => 'E-pasts ir obligāts.',
        'email.email'      => 'Ievadi derīgu e-pasta adresi.',
        'email.unique'     => 'Šis e-pasts jau ir reģistrēts.',
        'email.*'          => 'Ievadi derīgu e-pasta adresi.',
        'password.required'=> 'Parole ir obligāta.',
        'password.confirmed'=> 'Paroles nesakrīt.',
        'password.not_regex'=> 'Parole nedrīkst būt tik vienkārša.',
        'password.*'       => 'Parole neatbilst prasībām.',
    ]);

        $user = User::create([
            'name' => $request->name,
            'lastname' => $request->lastname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);


        event(new Registered($user));


        Auth::login($user);

        return redirect()->route('profile.setup.step1')
            ->with('success', 'Reģistrācija veiksmīga! Tagad aizpildi savu profilu.');
    }


}
