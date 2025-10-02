<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
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
