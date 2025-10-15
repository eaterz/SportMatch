<?php

use App\Models\User;
use App\Models\City;
use App\Models\Sport;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // 1. Create a city
    $this->city = City::create([
        'name' => 'Rīga',
        'region' => 'Rīgas',
        'latitude' => 56.9496,
        'longitude' => 24.1052,
        'population' => 614618,
    ]);

    // 2. Create a sport
    $this->basketball = Sport::create([
        'name' => 'Basketbols',
        'name_en' => 'Basketball',
        'icon' => '🏀',
        'is_active' => true,
    ]);

    // 3. Create a test user
    $this->user = User::factory()->create([
        'name' => 'Test',
        'lastname' => 'User',
        'email_verified_at' => now(),
    ]);

    // 4. Complete user profile
    $this->user->profile()->create([
        'birth_date' => '1995-01-01',
        'phone' => '+37120000000',
        'gender' => 'male',
        'bio' => 'Test user bio',
        'city_id' => $this->city->id,
    ]);

    $this->user->profile->photos()->create([
        'photo_path' => 'profiles/test.jpg',
        'is_main' => true,
    ]);

    // 5. Attach a sport to the user
    $this->user->sports()->attach($this->basketball->id, [
        'skill_level' => 'beginner',
        'is_preferred' => true,
    ]);

    // 6. Create group creator
    $this->groupCreator = User::factory()->create([
        'name' => 'Grupas',
        'lastname' => 'Veidotājs',
        'email_verified_at' => now(),
    ]);

    // 7. Create a public group
    $this->publicGroup = Group::create([
        'name' => 'Basketbola entuziasti',
        'description' => 'Grupa basketbola spēlētājiem no Rīgas.',
        'location' => 'Rīga',
        'is_private' => false,
        'creator_id' => $this->groupCreator->id,
    ]);
    $this->publicGroup->sports()->attach($this->basketball->id);

    // 8. Create a private group
    $this->privateGroup = Group::create([
        'name' => 'Privātā basketbola grupa',
        'description' => 'Tikai ar apstiprinājumu no administratora.',
        'location' => 'Rīga',
        'is_private' => true,
        'creator_id' => $this->groupCreator->id,
    ]);
    $this->privateGroup->sports()->attach($this->basketball->id);
});

it('can view groups page', function () {
    $this->actingAs($this->user);

    $page = visit('/groups');

    $page->assertSee('Sporta grupas')
        ->assertSee('Pievienojies grupām un atrodi domubiedrus');
});

it('can instantly join a public group', function () {
    $this->actingAs($this->user);
    //Atver tīmekļa vietnē grupu sadaļu
    $page = visit('/groups');

    // Pārbaude var redz šo grupu
    $page->assertSee('Basketbola entuziasti');

    // Nospiež pogu "Pievienoties"
    $page->click('Pievienoties');

    // Parbauda vai datubāzē ir pievienots lietotājs pie grupas
    $this->assertDatabaseHas('group_members', [
        'group_id' => $this->publicGroup->id,
        'user_id' => $this->user->id,
        'status' => 'approved',
    ]);
});

it('shows pending state when joining a private group', function () {
    $this->actingAs($this->user);

    // Visit groups page
    $page = visit('/groups');

    // Ensure private group is visible
    $page->assertSee('Privātā basketbola grupa');

    // Click "Pievienoties" button
    $page->click('Pievienoties');


    // Now the pending message should be visible
    $page->assertPresent('[data-testid="pending-approval"]')
        ->assertSee('Gaida apstiprinājumu');
});
