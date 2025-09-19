<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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




    // Saglabā jaunu lietotāju datubāzē un pieslēdz viņu sistēmai
    public function store(Request $request): RedirectResponse
    {
        // Validācija – pārbauda, vai lietotāja ievadītie dati ir korekti
        $request->validate([
            'name' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Izveido jaunu lietotāju datubāzē ar ievadītajiem datiem
        $user = User::create([
            'name' => $request->name, // saglabā vārdu
            'lastname' => $request->lastname, // saglabā uzvārdu
            'email' => $request->email, // saglabā e-pastu
            'password' => Hash::make($request->password), // paroli šifrē ar Hash
        ]);

        // Izsauc notikumu – jauns lietotājs reģistrēts (var nosūtīt e-pastu utt.)
        event(new Registered($user));

        // Automātiski pieslēdz jauno lietotāju sistēmā
        Auth::login($user);

        // Pēc reģistrācijas pāradresē uz profila aizpildīšanas pirmo soli ar paziņojumu
        return redirect()->route('profile.setup.step1')
            ->with('success', 'Reģistrācija veiksmīga! Tagad aizpildi savu profilu.');
    }

}
