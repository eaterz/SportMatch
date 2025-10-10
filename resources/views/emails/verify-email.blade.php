<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
<div class="container">
    <h2>Sveiki, {{ $user->name }}!</h2>
    <p>Paldies par reģistrāciju SportMatch! Lūdzu, apstiprini savu e-pasta adresi, noklikšķinot uz pogas zemāk:</p>

    <a href="{{ $url }}" class="button">Apstiprināt e-pastu</a>

    <p>Ja neesi izveidojis kontu SportMatch, lūdzu, ignorē šo e-pastu.</p>

    <div class="footer">
        <p>Ar cieņu,<br>SportMatch komanda</p>
    </div>
</div>
</body>
</html>
