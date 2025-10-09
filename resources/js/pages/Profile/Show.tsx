import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Camera, Trash2, Star, Edit2, Upload, MapPin, Phone, Mail, User, Search, Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/navbar';

interface City {
    id: number;
    name: string;
    region: string;
}

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    profile?: {
        age?: number;
        city_id?: number;
        city?: City;
        phone?: string;
        bio?: string;
        gender?: string;
        main_photo?: string;
        is_verified?: boolean;
        verification_status?: string;
        verification_submitted_at?: string;
        verification_rejected_reason?: string;
    };
    sports?: Array<{
        id: number;
        name: string;
        icon: string;
        pivot?: {
            skill_level: string;
            is_preferred: boolean;
        };
    }>;
}

interface Photo {
    id: number;
    photo_path: string;
    photo_url?: string;
    is_main: boolean;
}

interface Props {
    user: User;
    photos: Photo[];
    cities?: City[];
}

export default function ProfileShow({ user, photos = [], cities = [] }: Props) {
    const [editingBio, setEditingBio] = useState(false);
    const [editingInfo, setEditingInfo] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: bioData, setData: setBioData, post: postBio, processing: processingBio } = useForm({
        bio: user.profile?.bio || ''
    });

    const { data: infoData, setData: setInfoData, post: postInfo, processing: processingInfo } = useForm({
        phone: user.profile?.phone || '',
        city_id: user.profile?.city_id || null,
        bio: user.profile?.bio || ''
    });

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        city.region.toLowerCase().includes(searchCity.toLowerCase())
    );

    const selectedCity = cities.find(c => c.id === infoData.city_id);
    const currentCity = user.profile?.city;

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        router.post('/profile/photo', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                router.reload({ only: ['photos'] });
            }
        });
    };

    const setMainPhoto = (photoId: number) => {
        router.post(`/profile/photo/${photoId}/main`, {}, {
            preserveScroll: true
        });
    };

    const deletePhoto = (photoId: number) => {
        if (confirm('Vai tiešām vēlaties dzēst šo foto?')) {
            router.delete(`/profile/photo/${photoId}`, {
                preserveScroll: true
            });
        }
    };

    const saveBio = () => {
        postBio('/profile/bio', {
            preserveScroll: true,
            onSuccess: () => setEditingBio(false)
        });
    };

    const saveInfo = () => {
        postInfo('/profile/update', {
            preserveScroll: true,
            onSuccess: () => setEditingInfo(false)
        });
    };

    const getSkillLevelLabel = (level: string) => {
        const labels: Record<string, string> = {
            beginner: 'Iesācējs',
            intermediate: 'Vidējais',
            advanced: 'Pieredzējis'
        };
        return labels[level] || level;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Head title="Mans profils - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-r from-gray-600 to-black"></div>

                    <div className="px-6 sm:px-8 pb-8">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start -mt-16 gap-4 sm:gap-6">
                            {/* Profile Photo */}
                            <div className="relative flex-shrink-0">
                                <div className="w-32 h-32 bg-white rounded-2xl shadow-lg overflow-hidden border-4 border-white">
                                    {user.profile?.main_photo ? (
                                        <img
                                            src={user.profile.main_photo}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                            <User className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 bg-black text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                >
                                    <Camera className="w-5 h-5" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-8 min-w-0">
                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                        {user.name} {user.lastname}
                                    </h1>
                                    {user.profile?.is_verified && (
                                        <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                                            Verificēts
                                        </div>
                                    )}
                                </div>

                                {editingInfo ? (
                                    <div className="space-y-3 max-w-md mx-auto sm:mx-0">
                                        {/* City Selector */}
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={selectedCity ? selectedCity.name : searchCity}
                                                    onChange={(e) => {
                                                        setSearchCity(e.target.value);
                                                        setShowCityDropdown(true);
                                                        if (!e.target.value) {
                                                            setInfoData('city_id', null);
                                                        }
                                                    }}
                                                    onFocus={() => setShowCityDropdown(true)}
                                                    placeholder="Meklēt pilsētu..."
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* Dropdown */}
                                            {showCityDropdown && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setShowCityDropdown(false)}
                                                    />
                                                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                        {filteredCities.length > 0 ? (
                                                            filteredCities.map(city => (
                                                                <div
                                                                    key={city.id}
                                                                    onClick={() => {
                                                                        setInfoData('city_id', city.id);
                                                                        setSearchCity(city.name);
                                                                        setShowCityDropdown(false);
                                                                    }}
                                                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                                                        infoData.city_id === city.id ? 'bg-blue-50' : ''
                                                                    }`}
                                                                >
                                                                    <div className="font-medium text-gray-900">{city.name}</div>
                                                                    <div className="text-sm text-gray-500">{city.region} reģions</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-2 text-gray-500 text-sm">
                                                                Nav atrasta pilsēta
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={saveInfo}
                                                disabled={processingInfo || !infoData.city_id}
                                                className="flex-1 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Saglabāt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingInfo(false);
                                                    setShowCityDropdown(false);
                                                }}
                                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                            >
                                                Atcelt
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600 text-sm sm:text-base">
                                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                                <Mail className="w-4 h-4 flex-shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                            {currentCity && (
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                                    <span>{currentCity.name}</span>
                                                </div>
                                            )}
                                            {user.profile?.phone && (
                                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                    <span>{user.profile.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingInfo(true);
                                                setSearchCity('');
                                            }}
                                            className="text-black hover:text-gray-700 text-sm font-medium mt-2"
                                        >
                                            Rediģēt informāciju
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Par mani</h2>
                                {!editingBio && (
                                    <button
                                        onClick={() => setEditingBio(true)}
                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {editingBio ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={bioData.bio}
                                        onChange={e => setBioData('bio', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                        rows={4}
                                        maxLength={500}
                                        placeholder="Pastāsti par sevi..."
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            {bioData.bio.length}/500
                                        </span>
                                        <div className="space-x-2">
                                            <button
                                                onClick={saveBio}
                                                disabled={processingBio}
                                                className="px-4 py-2 bg-black text-white rounded-xl hover:shadow-lg transition-all text-sm"
                                            >
                                                Saglabāt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingBio(false);
                                                    setBioData('bio', user.profile?.bio || '');
                                                }}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm"
                                            >
                                                Atcelt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    {user.profile?.bio ||
                                        <span className="text-gray-400 italic">Nav pievienots apraksts. Noklikšķini uz zīmuļa, lai pievienotu!</span>
                                    }
                                </p>
                            )}
                        </div>

                        {/* Photo Gallery */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Foto galerija</h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto text-sm"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Pievienot</span>
                                </button>
                            </div>

                            {photos.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                    {photos.map(photo => (
                                        <div key={photo.id} className="relative group aspect-square">
                                            <img
                                                src={photo.photo_url || `/storage/${photo.photo_path}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-end justify-center pb-3 gap-2">
                                                {!photo.is_main && (
                                                    <button
                                                        onClick={() => setMainPhoto(photo.id)}
                                                        className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-all"
                                                        title="Iestatīt kā galveno"
                                                    >
                                                        <Star className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deletePhoto(photo.id)}
                                                    className="p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-all"
                                                    title="Dzēst"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                            {photo.is_main && (
                                                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                                    Galvenā
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-4 text-sm sm:text-base">Nav pievienotu bilžu</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                    >
                                        Pievienot pirmo bildi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sports & Verification */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Verification Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Verifikācija</h2>
                                {user.profile?.is_verified && (
                                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                                        Verificēts
                                    </div>
                                )}
                            </div>

                            {user.profile?.verification_status === 'verified' ? (
                                // Verified Status
                                <div className="text-center py-4 sm:py-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-2">
                                        Profils verificēts!
                                    </h3>
                                    <p className="text-green-700 text-xs sm:text-sm mb-4">
                                        Tavs profils ir veiksmīgi verificēts. Tu esi uzticams SportMatch kopienas dalībnieks.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Verificēts lietotājs</span>
                                    </div>
                                </div>
                            ) : user.profile?.verification_status === 'pending' ? (
                                // Pending Status
                                <div className="text-center py-4 sm:py-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-yellow-900 mb-2">
                                        Verifikācija procesā
                                    </h3>
                                    <p className="text-yellow-700 text-xs sm:text-sm mb-4">
                                        Mūsu komanda pārbauda tavus dokumentus. Parasti tas aizņem 1-3 darba dienas.
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-xs text-yellow-600 mb-3">
                                        <Clock className="w-4 h-4" />
                                        <span>{user.profile?.verification_submitted_at}</span>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                                        <p className="text-xs text-yellow-800">
                                            📧 Saņemsi e-pasta paziņojumu, kad verifikācija būs pabeigta
                                        </p>
                                    </div>
                                </div>
                            ) : user.profile?.verification_status === 'rejected' ? (
                                // Rejected Status
                                <div className="text-center py-4 sm:py-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2">
                                        Verifikācija noraidīta
                                    </h3>
                                    <p className="text-red-700 text-xs sm:text-sm mb-4">
                                        Diemžēl mēs nevarējām verificēt tavu profilu šā iemesla dēļ:
                                    </p>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
                                        <p className="text-xs sm:text-sm text-red-800">
                                            {user.profile?.verification_rejected_reason || 'Dokumenti neatbilst prasībām'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => router.get('/verification/start')}
                                        className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all text-sm"
                                    >
                                        Mēģināt vēlreiz
                                    </button>
                                </div>
                            ) : (
                                // Unverified Status
                                <div className="text-center py-4 sm:py-6">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                        Verificē savu profilu
                                    </h3>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-4">
                                        Iegūsti zilo atzīmi un palielini uzticamību SportMatch kopienā
                                    </p>

                                    {/* Benefits */}
                                    <div className="text-left bg-blue-50 rounded-lg p-3 sm:p-4 mb-4">
                                        <h4 className="font-medium text-blue-900 mb-2 text-sm">Verifikācijas ieguvumi:</h4>
                                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                <span>Zilā atzīme pie vārda</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                <span>Augstāka uzticamība</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                <span>Prioritāte meklēšanā</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                                <span>Piekļuve VIP funkcijām</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => router.get('/verification/start')}
                                        className="w-full px-4 py-3 bg-black hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-[1.02] text-sm"
                                    >
                                        Sākt verifikāciju
                                    </button>

                                    <p className="text-xs text-gray-500 mt-3">
                                        Nepieciešams: Selfie + ID dokuments
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sports Section */}
                        {user.sports && user.sports.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Mani sporta veidi</h2>
                                <div className="space-y-2 sm:space-y-3">
                                    {user.sports.map(sport => (
                                        <div key={sport.id} className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                <span className="text-xl sm:text-2xl flex-shrink-0">{sport.icon}</span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm sm:text-base text-gray-900">{sport.name}</p>
                                                    {sport.pivot && (
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {getSkillLevelLabel(sport.pivot.skill_level)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {sport.pivot?.is_preferred ? (
                                                <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" fill="currentColor" />
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
