<?php

use App\Models\User;

beforeEach(function () {
    // Izveido testa lietotāju
    $this->user = User::factory()->create([
        'name' => 'Arlijs',
        'lastname' => 'Briede',
        'email' => 'test@sportmatch.lv',
        'password' => bcrypt('pareizaParole123'),
    ]);
});

it('allows user to log in with valid credentials', function () {
    $page = visit('/login');

    $page->type('email', 'test@sportmatch.lv')
        ->type('password', 'pareizaParole123') // pareiza parole
        ->press('Pieslēgties')
        ->assertSee('Izveidosim tavu profilu'); // sagaidāmais saturs
});

it('does not allow user to log in with invalid password', function () {
    $page = visit('/login');

    $page->type('email', 'test@sportmatch.lv')
        ->type('password', 'nepareizaParole') // nepareiza parole
        ->press('Pieslēgties')
        ->assertPathIs('/login'); // paliek pie login lapas
});
