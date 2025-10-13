<?php

namespace Database\Seeders;

use App\Models\Sport;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $sports = [
            ['name' => 'Futbols', 'name_en' => 'Football', 'icon' => '⚽'],
            ['name' => 'Basketbols', 'name_en' => 'Basketball', 'icon' => '🏀'],
            ['name' => 'Teniss', 'name_en' => 'Tennis', 'icon' => '🎾'],
            ['name' => 'Volejbols', 'name_en' => 'Volleyball', 'icon' => '🏐'],
            ['name' => 'Badmintons', 'name_en' => 'Badminton', 'icon' => '🏸'],
            ['name' => 'Galda teniss', 'name_en' => 'Table Tennis', 'icon' => '🏓'],
            ['name' => 'Skrējiens', 'name_en' => 'Running', 'icon' => '🏃'],
            ['name' => 'Riteņbraukšana', 'name_en' => 'Cycling', 'icon' => '🚴'],
            ['name' => 'Peldēšana', 'name_en' => 'Swimming', 'icon' => '🏊'],
            ['name' => 'Fitnes', 'name_en' => 'Fitness', 'icon' => '💪'],
            ['name' => 'Jogas', 'name_en' => 'Yoga', 'icon' => '🧘'],
            ['name' => 'Bokss', 'name_en' => 'Boxing', 'icon' => '🥊'],
        ];

        foreach ($sports as $sport) {
            Sport::create($sport);
        }
        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@sportmatch.lv'],
            [
                'name' => 'Admin',
                'lastname' => 'SportMatch',
                'password' => Hash::make('AdminPassword123!'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create admin profile
        $admin->profile()->firstOrCreate([
            'birth_date' => '1990-01-01',
            'phone' => '+37112345678',
            'gender' => 'male',
            'bio' => 'SportMatch Administrator',
            'city_id' => 1,
            'is_verified' => true,
            'verified_at' => now(),
            'verification_method' => 'manual'
        ]);
    }


}
