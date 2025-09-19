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
        // Izveido 'users' tabulu, kur glabāsies reģistrēto lietotāju dati
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Primārā atslēga 'id'
            $table->string('name'); // Lietotāja vārds
            $table->string('lastname'); // Lietotāja uzvārds
            $table->string('email')->unique(); // E-pasts, jābūt unikālam
            $table->timestamp('email_verified_at')->nullable(); // Laiks, kad e-pasts apstiprināts
            $table->string('password'); // Lietotāja parole
            $table->rememberToken(); // Tokena glabāšana automātiskai pieteikšanās atcerēšanai
            $table->timestamps(); // Automātiski lauki 'created_at' un 'updated_at'
        });

        // Izveido 'password_reset_tokens' tabulu paroļu atjaunošanai
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary(); // Primārā atslēga - lietotāja e-pasts
            $table->string('token'); // Tokena vērtība paroļu atjaunošanai
            $table->timestamp('created_at')->nullable(); // Tokena izveides laiks
        });

        // Izveido 'sessions' tabulu, lai saglabātu lietotāju sesijas
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary(); // Sesijas ID kā primārā atslēga
            $table->foreignId('user_id')->nullable()->index(); // Lietotāja ID, kuram pieder sesija
            $table->string('ip_address', 45)->nullable(); // Lietotāja IP adrese
            $table->text('user_agent')->nullable(); // Informācija par pārlūkprogrammu vai ierīci
            $table->longText('payload'); // Sesijas dati
            $table->integer('last_activity')->index(); // Laiks pēdējai aktivitātei
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
