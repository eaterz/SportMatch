<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // migration: create_sports_table.php
        Schema::create('sports', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 'Futbols', 'Basketbols', 'Teniss'
            $table->string('name_en')->nullable(); // Angļu nosaukums
            $table->string('icon')->nullable(); // Ikonas nosaukums
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sports');
    }
};
