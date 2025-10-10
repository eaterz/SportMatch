<?php

use App\Models\User;
use App\Models\Sport;
use App\Models\City;

beforeEach(function () {
    // Create test cities
    $this->city1 = City::create([
        'name' => 'Rīga',
        'region' => 'Rīgas',
        'latitude' => 56.9496,
        'longitude' => 24.1052,
        'population' => 614618
    ]);

    // Create test sports
    $this->tennis = Sport::create([
        'name' => 'Teniss',
        'name_en' => 'Tennis',
        'icon' => '🎾',
        'is_active' => true
    ]);

    $this->basketball = Sport::create([
        'name' => 'Basketbols',
        'name_en' => 'Basketball',
        'icon' => '🏀',
        'is_active' => true
    ]);

    $this->football = Sport::create([
        'name' => 'Futbols',
        'name_en' => 'Football',
        'icon' => '⚽',
        'is_active' => true
    ]);

    // Create main test user
    $this->user = User::factory()->create([
        'name' => 'Test',
        'lastname' => 'User',
        'is_admin' => false,
        'email_verified_at' => now()
    ]);

    $this->user->profile()->create([
        'birth_date' => '1995-01-01',
        'phone' => '+37120000000',
        'gender' => 'male',
        'bio' => 'Test user bio',
        'city_id' => $this->city1->id
    ]);

    $this->user->profile->photos()->create([
        'photo_path' => 'profiles/test.jpg',
        'is_main' => true
    ]);

    $this->user->sports()->attach($this->football->id, [
        'skill_level' => 'beginner',
        'is_preferred' => false
    ]);

    // Create tennis player
    $this->tennisPlayer = User::factory()->create([
        'name' => 'Tennis',
        'lastname' => 'Player',
        'is_admin' => false,
        'email_verified_at' => now()
    ]);

    $this->tennisPlayer->profile()->create([
        'birth_date' => '1992-05-15',
        'phone' => '+37120000001',
        'gender' => 'male',
        'bio' => 'I love playing tennis',
        'city_id' => $this->city1->id
    ]);

    $this->tennisPlayer->profile->photos()->create([
        'photo_path' => 'profiles/tennis.jpg',
        'is_main' => true
    ]);

    $this->tennisPlayer->sports()->attach($this->tennis->id, [
        'skill_level' => 'intermediate',
        'is_preferred' => true
    ]);

    // Create basketball player
    $this->basketballPlayer = User::factory()->create([
        'name' => 'Basketball',
        'lastname' => 'Player',
        'is_admin' => false,
        'email_verified_at' => now()
    ]);

    $this->basketballPlayer->profile()->create([
        'birth_date' => '1990-08-20',
        'phone' => '+37120000002',
        'gender' => 'female',
        'bio' => 'Basketball enthusiast',
        'city_id' => $this->city1->id
    ]);

    $this->basketballPlayer->profile->photos()->create([
        'photo_path' => 'profiles/basketball.jpg',
        'is_main' => true
    ]);

    $this->basketballPlayer->sports()->attach($this->basketball->id, [
        'skill_level' => 'advanced',
        'is_preferred' => false
    ]);

    // Create player who plays both tennis and basketball
    $this->bothSportsPlayer = User::factory()->create([
        'name' => 'Multi',
        'lastname' => 'Sport Player',
        'is_admin' => false,
        'email_verified_at' => now()
    ]);

    $this->bothSportsPlayer->profile()->create([
        'birth_date' => '1993-03-10',
        'phone' => '+37120000003',
        'gender' => 'male',
        'bio' => 'I play multiple sports',
        'city_id' => $this->city1->id
    ]);

    $this->bothSportsPlayer->profile->photos()->create([
        'photo_path' => 'profiles/both.jpg',
        'is_main' => true
    ]);

    $this->bothSportsPlayer->sports()->attach($this->tennis->id, [
        'skill_level' => 'beginner',
        'is_preferred' => false
    ]);

    $this->bothSportsPlayer->sports()->attach($this->basketball->id, [
        'skill_level' => 'intermediate',
        'is_preferred' => true
    ]);
});

it('can view partner search page', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->assertSee('Meklēt sporta partnerus')
        ->assertSee('Atrodi cilvēkus ar līdzīgām sporta interesēm');
});

it('shows all partners without filter', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->assertSee('Tennis')
        ->assertSee('Basketball')
        ->assertSee('Multi');
});

it('can filter partners by tennis sport', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Filtri')
        ->select('sport', (string) $this->tennis->id)
        ->click('Pielietot filtrus')
        ->assertSee('Tennis')
        ->assertSee('Multi')
        ->assertDontSee('Basketball');
});

it('can filter partners by basketball sport', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Filtri')
        ->select('sport', (string) $this->basketball->id)
        ->click('Pielietot filtrus')
        ->assertSee('Basketball')
        ->assertSee('Multi')
        ->assertDontSee('Tennis');
});

it('shows no results when filtering by football sport', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Filtri')
        ->select('sport', (string) $this->football->id)
        ->click('Pielietot filtrus')
        ->assertSee('Nav atrasti partneri')
        ->assertDontSee('Tennis')
        ->assertDontSee('Basketball');
});

it('can clear sport filter', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Filtri')
        ->select('Sporta veids', (string) $this->tennis->id)
        ->click('Pielietot filtrus')
        ->assertDontSee('Basketball')
        ->click('Notīrīt filtrus')
        ->assertSee('Tennis')
        ->assertSee('Basketball')
        ->assertSee('Multi');
});

it('does not show current user in results', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->assertSee('Tennis')
        ->assertDontSee('Test User');
});

it('can click partner card to view profile modal', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Tennis')
        ->assertSee('I love playing tennis');
});

it('can send friend request to partner', function () {
    $this->actingAs($this->user);

    $page = visit('/partners');

    $page->click('Pievienot')
        ->assertSee('Nosūtīts');
});
