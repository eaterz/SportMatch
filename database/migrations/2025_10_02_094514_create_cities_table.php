<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('region')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->integer('population')->nullable();
            $table->timestamps();

            $table->index('name');
        });

        // Insert cities data
        DB::table('cities')->insert([
            ['name' => 'Rīga', 'region' => 'Rīgas', 'latitude' => 56.9496, 'longitude' => 24.1052, 'population' => 614618, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Daugavpils', 'region' => 'Latgales', 'latitude' => 55.8747, 'longitude' => 26.5362, 'population' => 82604, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Liepāja', 'region' => 'Kurzemes', 'latitude' => 56.5046, 'longitude' => 21.0114, 'population' => 68535, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jelgava', 'region' => 'Zemgales', 'latitude' => 56.6510, 'longitude' => 23.7134, 'population' => 55972, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jūrmala', 'region' => 'Rīgas', 'latitude' => 56.9682, 'longitude' => 23.6178, 'population' => 49920, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ventspils', 'region' => 'Kurzemes', 'latitude' => 57.3943, 'longitude' => 21.5644, 'population' => 33906, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Rēzekne', 'region' => 'Latgales', 'latitude' => 56.5104, 'longitude' => 27.3331, 'population' => 26593, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Valmiera', 'region' => 'Vidzemes', 'latitude' => 57.5389, 'longitude' => 25.4267, 'population' => 23147, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jēkabpils', 'region' => 'Zemgales', 'latitude' => 56.4989, 'longitude' => 25.8736, 'population' => 22443, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ogre', 'region' => 'Rīgas', 'latitude' => 56.8162, 'longitude' => 24.6044, 'population' => 22709, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tukums', 'region' => 'Kurzemes', 'latitude' => 56.9672, 'longitude' => 23.1558, 'population' => 17322, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Salaspils', 'region' => 'Rīgas', 'latitude' => 56.8611, 'longitude' => 24.3486, 'population' => 17474, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cēsis', 'region' => 'Vidzemes', 'latitude' => 57.3117, 'longitude' => 25.2681, 'population' => 14832, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kuldīga', 'region' => 'Kurzemes', 'latitude' => 56.9681, 'longitude' => 21.9689, 'population' => 10186, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Olaine', 'region' => 'Rīgas', 'latitude' => 56.7858, 'longitude' => 23.9378, 'population' => 11910, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Saldus', 'region' => 'Kurzemes', 'latitude' => 56.6642, 'longitude' => 22.4881, 'population' => 10282, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Talsi', 'region' => 'Kurzemes', 'latitude' => 57.2444, 'longitude' => 22.5878, 'population' => 9750, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sigulda', 'region' => 'Vidzemes', 'latitude' => 57.1542, 'longitude' => 24.8536, 'population' => 11719, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Dobele', 'region' => 'Zemgales', 'latitude' => 56.6242, 'longitude' => 23.2794, 'population' => 8880, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Bauska', 'region' => 'Zemgales', 'latitude' => 56.4067, 'longitude' => 24.1903, 'population' => 8853, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Krāslava', 'region' => 'Latgales', 'latitude' => 55.8953, 'longitude' => 27.1686, 'population' => 8074, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Līvāni', 'region' => 'Latgales', 'latitude' => 56.3547, 'longitude' => 26.1769, 'population' => 7374, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Madona', 'region' => 'Vidzemes', 'latitude' => 56.8536, 'longitude' => 26.2169, 'population' => 7264, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Aizkraukle', 'region' => 'Zemgales', 'latitude' => 56.6047, 'longitude' => 25.2553, 'population' => 6698, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ludza', 'region' => 'Latgales', 'latitude' => 56.5464, 'longitude' => 27.7169, 'population' => 8244, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gulbene', 'region' => 'Vidzemes', 'latitude' => 57.1772, 'longitude' => 26.7536, 'population' => 8027, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Alūksne', 'region' => 'Vidzemes', 'latitude' => 57.4242, 'longitude' => 27.0483, 'population' => 6968, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Limbaži', 'region' => 'Vidzemes', 'latitude' => 57.5139, 'longitude' => 24.7147, 'population' => 6788, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Balvi', 'region' => 'Latgales', 'latitude' => 57.1322, 'longitude' => 27.2631, 'population' => 6675, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Preiļi', 'region' => 'Latgales', 'latitude' => 56.2942, 'longitude' => 26.7242, 'population' => 6430, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
