<?php

namespace Database\Seeders;

use App\Models\Sport;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserSport;
use App\Models\UserProfilePhoto;
use App\Models\Friendship;
use App\Models\Group;
use App\Models\GroupEvent;
use App\Models\GroupPost;
use App\Models\AvailabilitySchedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // =====================
        // 1. SPORTI
        // =====================
        $sports = [
            ['name' => 'Futbols',       'name_en' => 'Football',     'icon' => '⚽'],
            ['name' => 'Basketbols',    'name_en' => 'Basketball',   'icon' => '🏀'],
            ['name' => 'Teniss',        'name_en' => 'Tennis',       'icon' => '🎾'],
            ['name' => 'Volejbols',     'name_en' => 'Volleyball',   'icon' => '🏐'],
            ['name' => 'Badmintons',    'name_en' => 'Badminton',    'icon' => '🏸'],
            ['name' => 'Galda teniss',  'name_en' => 'Table Tennis', 'icon' => '🏓'],
            ['name' => 'Skriešana',     'name_en' => 'Running',      'icon' => '🏃'],
            ['name' => 'Riteņbraukšana','name_en' => 'Cycling',      'icon' => '🚴'],
            ['name' => 'Peldēšana',     'name_en' => 'Swimming',     'icon' => '🏊'],
            ['name' => 'Fitnes',        'name_en' => 'Fitness',      'icon' => '💪'],
            ['name' => 'Joga',          'name_en' => 'Yoga',         'icon' => '🧘'],
            ['name' => 'Bokss',         'name_en' => 'Boxing',       'icon' => '🥊'],
        ];

        $sportIds = [];
        foreach ($sports as $sport) {
            $s = Sport::firstOrCreate(['name' => $sport['name']], $sport);
            $sportIds[$sport['name_en']] = $s->id;
        }

        // =====================
        // 2. ADMINS
        // =====================
        $admin = User::firstOrCreate(
            ['email' => 'admin@sportmatch.lv'],
            [
                'name'              => 'Admin',
                'lastname'          => 'SportMatch',
                'password'          => Hash::make('AdminPassword123!'),
                'is_admin'          => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->profile()->firstOrCreate(['user_id' => $admin->id], [
            'birth_date'          => '1990-01-01',
            'phone'               => '+37112345678',
            'gender'              => 'male',
            'bio'                 => 'SportMatch administrators',
            'city_id'             => 1,
            'is_verified'         => true,
            'verified_at'         => now(),
            'verification_method' => 'manual',
        ]);

        // =====================
        // 3. TESTA LIETOTĀJI
        // =====================
        $usersData = [
            [
                'name' => 'Māris', 'lastname' => 'Kalniņš', 'email' => 'maris@sportmatch.lv',
                'gender' => 'male', 'birth_date' => '1995-03-15', 'city_id' => 1,
                'bio' => 'Aktīvs futbola un basketbola spēlētājs. Meklēju partnerus treniņiem Rīgā!',
                'sports' => ['Football' => 'intermediate', 'Basketball' => 'beginner'],
                'days' => ['monday' => ['08:00', '10:00'], 'wednesday' => ['18:00', '20:00'], 'saturday' => ['10:00', '13:00']],
            ],
            [
                'name' => 'Anna', 'lastname' => 'Bērziņa', 'email' => 'anna@sportmatch.lv',
                'gender' => 'female', 'birth_date' => '1998-07-22', 'city_id' => 1,
                'bio' => 'Tenisa entuziaste un jogas praktizētāja. Labprāt trenējos rītos!',
                'sports' => ['Tennis' => 'advanced', 'Yoga' => 'intermediate'],
                'days' => ['tuesday' => ['07:00', '09:00'], 'thursday' => ['07:00', '09:00'], 'sunday' => ['09:00', '11:00']],
            ],
            [
                'name' => 'Jānis', 'lastname' => 'Ozols', 'email' => 'janis@sportmatch.lv',
                'gender' => 'male', 'birth_date' => '1992-11-08', 'city_id' => 2,
                'bio' => 'Skriešanas un riteņbraukšanas cienītājs. Daugavpils apkārtne.',
                'sports' => ['Running' => 'advanced', 'Cycling' => 'intermediate'],
                'days' => ['monday' => ['06:00', '08:00'], 'friday' => ['06:00', '08:00'], 'saturday' => ['08:00', '12:00']],
            ],
            [
                'name' => 'Laura', 'lastname' => 'Liepiņa', 'email' => 'laura@sportmatch.lv',
                'gender' => 'female', 'birth_date' => '2000-05-30', 'city_id' => 1,
                'bio' => 'Volejbola un peldēšanas fans. Vienmēr gatava jauniem izaicinājumiem!',
                'sports' => ['Volleyball' => 'intermediate', 'Swimming' => 'beginner'],
                'days' => ['wednesday' => ['17:00', '19:00'], 'friday' => ['17:00', '19:00'], 'sunday' => ['11:00', '13:00']],
            ],
            [
                'name' => 'Pēteris', 'lastname' => 'Zariņš', 'email' => 'peteris@sportmatch.lv',
                'gender' => 'male', 'birth_date' => '1988-09-14', 'city_id' => 3,
                'bio' => 'Boksa treneris un fitnes entuziasts. Liepāja.',
                'sports' => ['Boxing' => 'advanced', 'Fitness' => 'advanced'],
                'days' => ['tuesday' => ['19:00', '21:00'], 'thursday' => ['19:00', '21:00'], 'saturday' => ['10:00', '12:00']],
            ],
            [
                'name' => 'Ilze', 'lastname' => 'Ķēniņa', 'email' => 'ilze@sportmatch.lv',
                'gender' => 'female', 'birth_date' => '1996-01-19', 'city_id' => 1,
                'bio' => 'Galda tenisa un badmintona spēlētāja. Rīgas centrs.',
                'sports' => ['Table Tennis' => 'intermediate', 'Badminton' => 'beginner'],
                'days' => ['monday' => ['12:00', '14:00'], 'wednesday' => ['12:00', '14:00'], 'friday' => ['12:00', '14:00']],
            ],
            [
                'name' => 'Rihards', 'lastname' => 'Vītols', 'email' => 'rihards@sportmatch.lv',
                'gender' => 'male', 'birth_date' => '1993-06-25', 'city_id' => 4,
                'bio' => 'Basketbolists un futbola fans. Jelgava.',
                'sports' => ['Basketball' => 'advanced', 'Football' => 'intermediate'],
                'days' => ['tuesday' => ['20:00', '22:00'], 'saturday' => ['14:00', '17:00'], 'sunday' => ['14:00', '17:00']],
            ],
            [
                'name' => 'Kristīne', 'lastname' => 'Ādamsone', 'email' => 'kristine@sportmatch.lv',
                'gender' => 'female', 'birth_date' => '1999-12-03', 'city_id' => 1,
                'bio' => 'Skriešanas un jogas cienītāja. Meklēju skriešanas partnerus Rīgā!',
                'sports' => ['Running' => 'beginner', 'Yoga' => 'advanced'],
                'days' => ['monday' => ['07:00', '08:30'], 'wednesday' => ['07:00', '08:30'], 'saturday' => ['09:00', '11:00']],
            ],
            [
                'name' => 'Edgars', 'lastname' => 'Siliņš', 'email' => 'edgars@sportmatch.lv',
                'gender' => 'male', 'birth_date' => '1991-04-17', 'city_id' => 5,
                'bio' => 'Peldētājs un riteņbraucējs. Jūrmala ir mana māja!',
                'sports' => ['Swimming' => 'advanced', 'Cycling' => 'advanced'],
                'days' => ['tuesday' => ['06:30', '08:00'], 'thursday' => ['06:30', '08:00'], 'sunday' => ['08:00', '11:00']],
            ],
            [
                'name' => 'Viktorija', 'lastname' => 'Pavlova', 'email' => 'viktorija@sportmatch.lv',
                'gender' => 'female', 'birth_date' => '1997-08-11', 'city_id' => 1,
                'bio' => 'Tenisa un volejbola spēlētāja. Rīga.',
                'sports' => ['Tennis' => 'beginner', 'Volleyball' => 'advanced'],
                'days' => ['wednesday' => ['19:00', '21:00'], 'friday' => ['19:00', '21:00'], 'saturday' => ['11:00', '14:00']],
            ],
        ];

        $createdUsers = [];
        foreach ($usersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'              => $data['name'],
                    'lastname'          => $data['lastname'],
                    'password'          => Hash::make('Password123!'),
                    'email_verified_at' => now(),
                    'is_admin'          => false,
                ]
            );

            $profile = $user->profile()->firstOrCreate(['user_id' => $user->id], [
                'birth_date' => $data['birth_date'],
                'phone'      => '+371' . rand(20000000, 29999999),
                'gender'     => $data['gender'],
                'bio'        => $data['bio'],
                'city_id'    => $data['city_id'],
                'is_verified'=> rand(0, 1) === 1,
            ]);

            // Sporta veidi
            foreach ($data['sports'] as $sportEn => $level) {
                if (isset($sportIds[$sportEn])) {
                    UserSport::firstOrCreate(
                        ['user_id' => $user->id, 'sport_id' => $sportIds[$sportEn]],
                        ['skill_level' => $level, 'is_preferred' => true]
                    );
                    // Attach to sports relationship
                    if (!$user->sports()->where('sport_id', $sportIds[$sportEn])->exists()) {
                        $user->sports()->attach($sportIds[$sportEn], [
                            'skill_level'  => $level,
                            'is_preferred' => true,
                        ]);
                    }
                }
            }

            // Pieejamības grafiks
            foreach ($data['days'] as $day => $times) {
                AvailabilitySchedule::firstOrCreate(
                    ['user_id' => $user->id, 'day_of_week' => $day],
                    ['start_time' => $times[0], 'end_time' => $times[1]]
                );
            }

            $createdUsers[] = $user;
        }

        // =====================
        // 4. DRAUDZĪBAS
        // =====================
        $friendPairs = [
            [0, 1], [0, 2], [0, 3], // Māris draugi
            [1, 3], [1, 5],          // Anna draugi
            [2, 6],                  // Jānis draugi
            [3, 7], [3, 9],          // Laura draugi
            [4, 6],                  // Pēteris draugi
            [7, 8],                  // Kristīne draugi
        ];

        foreach ($friendPairs as [$a, $b]) {
            if (isset($createdUsers[$a], $createdUsers[$b])) {
                Friendship::firstOrCreate(
                    [
                        'sender_id'   => $createdUsers[$a]->id,
                        'receiver_id' => $createdUsers[$b]->id,
                    ],
                    [
                        'status'      => 'accepted',
                        'accepted_at' => now()->subDays(rand(1, 30)),
                    ]
                );
            }
        }

        // Gaida pieprasījumi
        $pendingPairs = [[5, 0], [6, 1], [8, 0]];
        foreach ($pendingPairs as [$a, $b]) {
            if (isset($createdUsers[$a], $createdUsers[$b])) {
                Friendship::firstOrCreate(
                    [
                        'sender_id'   => $createdUsers[$a]->id,
                        'receiver_id' => $createdUsers[$b]->id,
                    ],
                    ['status' => 'pending']
                );
            }
        }

        // =====================
        // 5. GRUPAS
        // =====================
        $groupsData = [
            [
                'name'        => 'Rīgas Futbola Klubs',
                'description' => 'Futbola entuziasti no Rīgas! Spēlējam katru nedēļu Mežaparka stadionā. Visi līmeņi laipni gaidīti.',
                'creator'     => 0,
                'city_id'     => 1,
                'sport'       => 'Football',
                'skill'       => 'all',
                'max'         => 22,
                'private'     => false,
                'members'     => [1, 3, 6, 7],
                'posts' => [
                    ['user' => 0, 'content' => 'Šonedēļ sestdien spēlējam 10:00! Lūdzu apstipriniet dalību komentāros 👇⚽'],
                    ['user' => 1, 'content' => 'Lieliski treniņi vakar! Paldies visiem kas ieradās. Nākamreiz mēģināsim jaunu taktiku.'],
                    ['user' => 3, 'content' => 'Vai kāds var atvest rezerves bumbu sestdien? Manējā ir nodūrta 😅'],
                ],
                'events' => [
                    [
                        'title'       => 'Nedēļas futbola spēle',
                        'description' => 'Regulārā nedēļas spēle Mežaparka stadionā. Dalīsimies 2 komandās.',
                        'days'        => 7,
                        'duration'    => 1.5,
                        'max'         => 22,
                        'price'       => 0,
                    ],
                    [
                        'title'       => 'Futbola turnīrs',
                        'description' => 'Mūsu kluba iekšējais turnīrs. 4 komandas, izslēgšanas sistēma!',
                        'days'        => 14,
                        'duration'    => 4,
                        'max'         => 22,
                        'price'       => 5,
                    ],
                ],
            ],
            [
                'name'        => 'Rīgas Tenisa Entuziasti',
                'description' => 'Tenisa spēlētāji no Rīgas un apkārtnes. Spēlējam gan iekštelpās, gan āra kortos.',
                'creator'     => 1,
                'city_id'     => 1,
                'sport'       => 'Tennis',
                'skill'       => 'intermediate',
                'max'         => 16,
                'private'     => false,
                'members'     => [0, 5, 9],
                'posts' => [
                    ['user' => 1, 'content' => 'Šonedēļ spēlējam Lielupē! Korts rezervēts no 14:00 līdz 18:00 🎾'],
                    ['user' => 9, 'content' => 'Vai kāds vēlas spēlēt dubultspēli svētdien? Mums vajag vēl vienu pāri!'],
                ],
                'events' => [
                    [
                        'title'       => 'Tenisa dubultspēļu vakars',
                        'description' => 'Dubultspēļu turnīrs. Piesakieties pārī vai mēs saformēsim komandas.',
                        'days'        => 5,
                        'duration'    => 2,
                        'max'         => 8,
                        'price'       => 3,
                    ],
                ],
            ],
            [
                'name'        => 'Rītas Skrējēji',
                'description' => 'Rīta skriešanas grupa Rīgā. Skrejam katru darba dienu 7:00 no Esplanādes. Visi tempi laipni gaidīti!',
                'creator'     => 2,
                'city_id'     => 1,
                'sport'       => 'Running',
                'skill'       => 'all',
                'max'         => 30,
                'private'     => false,
                'members'     => [0, 3, 7, 8],
                'posts' => [
                    ['user' => 2, 'content' => 'Rīt skrejam Mežaparkā! Satiekamies 7:00 pie Lielās estrādes 🏃‍♂️'],
                    ['user' => 7, 'content' => 'Šodien bija fantastiski! 10km jaunā rekordā. Paldies grupai par motivāciju! 💪'],
                    ['user' => 8, 'content' => 'Vai plānojam piedalīties Rīgas maratonā? Es esmu par! 🏅'],
                    ['user' => 3, 'content' => 'Es pieteikšos maratonam! Kurš vēl? Varētu trenēties kopā.'],
                ],
                'events' => [
                    [
                        'title'       => 'Rīta skrējiens Mežaparkā',
                        'description' => '10km skrējiens caur Mežaparku. Temps ~6 min/km. Visi līmeņi laipni gaidīti.',
                        'days'        => 3,
                        'duration'    => 1,
                        'max'         => 20,
                        'price'       => 0,
                    ],
                    [
                        'title'       => 'Pusstundas ātruma treniņš',
                        'description' => 'Intervālu treniņš ātruma uzlabošanai. Piemērots vidējiem un pieredzējušiem.',
                        'days'        => 10,
                        'duration'    => 0.5,
                        'max'         => 15,
                        'price'       => 0,
                    ],
                ],
            ],
            [
                'name'        => 'Basketbola Frīstails Rīgā',
                'description' => 'Neformāla basketbola grupa. Spēlējam 3x3 un 5x5 Āgenskalna laukumā. Bez noteikumiem — tikai prieks!',
                'creator'     => 6,
                'city_id'     => 1,
                'sport'       => 'Basketball',
                'skill'       => 'beginner',
                'max'         => 20,
                'private'     => false,
                'members'     => [0, 3, 7],
                'posts' => [
                    ['user' => 6, 'content' => 'Šovakar spēlējam! 19:00 Āgenskalns. Nāciet visi — vajag spēlētājus! 🏀'],
                    ['user' => 0, 'content' => 'Vakardienas spēle bija 🔥! Jāpiezvanās nākamajai!'],
                ],
                'events' => [
                    [
                        'title'       => '3x3 basketbola turnīrs',
                        'description' => 'Ielu basketbola turnīrs. Piesakieties trijatā vai atrodiet komandu pie mums.',
                        'days'        => 12,
                        'duration'    => 3,
                        'max'         => 18,
                        'price'       => 2,
                    ],
                ],
            ],
            [
                'name'        => 'Liepājas Boksa Klubs',
                'description' => 'Boksa treniņi Liepājā. Profesionāls treneris, moderns aprīkojums. Iesācēji laipni gaidīti!',
                'creator'     => 4,
                'city_id'     => 3,
                'sport'       => 'Boxing',
                'skill'       => 'all',
                'max'         => 15,
                'private'     => false,
                'members'     => [6],
                'posts' => [
                    ['user' => 4, 'content' => 'Jaunā sezona sākusies! Reģistrācija atvērta. Pirmā treniņa izmēģinājums — bez maksas! 🥊'],
                ],
                'events' => [
                    [
                        'title'       => 'Iesācēju boksa treniņš',
                        'description' => 'Speciāls treniņš iesācējiem. Iemācīsimies pamatus drošā vidē.',
                        'days'        => 6,
                        'duration'    => 1.5,
                        'max'         => 10,
                        'price'       => 8,
                    ],
                ],
            ],
        ];

        foreach ($groupsData as $gData) {
            $creator = $createdUsers[$gData['creator']] ?? $createdUsers[0];

            $group = Group::firstOrCreate(
                ['name' => $gData['name']],
                [
                    'description' => $gData['description'],
                    'creator_id'  => $creator->id,
                    'city_id'     => $gData['city_id'],
                    'max_members' => $gData['max'],
                    'is_private'  => $gData['private'],
                    'is_active'   => true,
                ]
            );

            // Pievieno sporta veidu
            if (isset($sportIds[$gData['sport']]) && !$group->sports()->where('sport_id', $sportIds[$gData['sport']])->exists()) {
                $group->sports()->attach($sportIds[$gData['sport']], ['skill_level' => $gData['skill']]);
            }

            // Pievieno izveidotāju kā adminu
            if (!$group->members()->where('user_id', $creator->id)->exists()) {
                $group->members()->attach($creator->id, [
                    'role'      => 'admin',
                    'status'    => 'approved',
                    'joined_at' => now()->subDays(rand(20, 60)),
                ]);
            }

            // Pievieno dalībniekus
            foreach ($gData['members'] as $memberIdx) {
                if (isset($createdUsers[$memberIdx])) {
                    $member = $createdUsers[$memberIdx];
                    if (!$group->members()->where('user_id', $member->id)->exists()) {
                        $group->members()->attach($member->id, [
                            'role'      => 'member',
                            'status'    => 'approved',
                            'joined_at' => now()->subDays(rand(1, 19)),
                        ]);
                    }
                }
            }

            // Izveido ierakstus
            foreach ($gData['posts'] as $postData) {
                $postUser = $createdUsers[$postData['user']] ?? $creator;
                GroupPost::create([
                    'group_id'   => $group->id,
                    'user_id'    => $postUser->id,
                    'content'    => $postData['content'],
                    'created_at' => now()->subDays(rand(1, 14))->subHours(rand(0, 12)),
                ]);
            }

            // Izveido pasākumus
            foreach ($gData['events'] as $eventData) {
                $event = GroupEvent::create([
                    'group_id'         => $group->id,
                    'creator_id'       => $creator->id,
                    'title'            => $eventData['title'],
                    'description'      => $eventData['description'],
                    'city_id'          => $gData['city_id'],
                    'event_date'       => now()->addDays($eventData['days']),
                    'duration'         => $eventData['duration'],
                    'max_participants' => $eventData['max'],
                    'price'            => $eventData['price'],
                    'status'           => 'upcoming',
                ]);

                // Pievieno izveidotāju kā dalībnieku
                $event->addParticipant($creator, 'going');

                // Pievieno dažus dalībniekus
                foreach (array_slice($gData['members'], 0, 3) as $memberIdx) {
                    if (isset($createdUsers[$memberIdx])) {
                        $event->addParticipant($createdUsers[$memberIdx], 'going');
                    }
                }
            }
        }

        $this->command->info('✅ Seeding pabeigts!');
        $this->command->info('👤 Admin: admin@sportmatch.lv / AdminPassword123!');
        $this->command->info('👤 Lietotāji: maris@sportmatch.lv, anna@sportmatch.lv, u.c. / Password123!');
        $this->command->info('👥 ' . count($createdUsers) . ' lietotāji izveidoti');
        $this->command->info('🏟️  ' . count($groupsData) . ' grupas izveidotas');
    }
}
