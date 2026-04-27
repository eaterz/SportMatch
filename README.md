# SportMatch

## Prasības

* PHP 8.3+
* Composer
* Node.js + npm
* SQLite

## Uzstādīšana

```bash
git clone https://github.com/eaterz/SportMatch.git
cd SportMatch
```

```bash
composer install
npm install
```

```bash
cp .env.example .env
php artisan key:generate
```

## Datubāze

Izveido SQLite failu:

```bash
touch database/database.sqlite
```

`.env` failā pārliecinies, ka ir:

```env
DB_CONNECTION=sqlite
```

Palaid migrācijas:

```bash
php artisan migrate --seed
```

## Projekta palaišana

```bash
composer run dev
```

Atver:

```txt
http://127.0.0.1:8000
```

## Google OAuth

Ja nepieciešams Google login, `.env` failā pievieno:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URL=http://127.0.0.1:8000/auth/google/callback
```

## Noderīgas komandas

```bash
php artisan migrate:fresh --seed
```

```bash
composer run test
```

```bash
npm run build
```
