import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Settings, Users, MessageSquare, Calendar,
    Trash2, Upload, X, Lock, Globe, Plus, Search, MapPin, LoaderCircle
} from 'lucide-react';
import { useFormWithErrors } from '@/hooks/useFormWithErrors';

interface User {
    id: number;
    name: string;
    lastname?: string;
}

interface Sport {
    id: number;
    name: string;
    icon: string;
    pivot?: {
        skill_level: string;
    };
}

interface City {
    id: number;
    name: string;
    region: string;
}

interface Group {
    id: number;
    name: string;
    description?: string;
    city_id?: number;
    cover_photo_url?: string;
    is_private: boolean;
    max_members?: number;
    creator: User;
    sports: Sport[];
}

interface MemberStats {
    total_members: number;
    pending_members: number;
    total_posts: number;
    total_events: number;
    upcoming_events: number;
}

interface Props {
    user: User;
    group: Group;
    sports: Sport[];
    cities: City[];
    memberStats: MemberStats;
}

export default function GroupSettings({ user, group, sports, cities, memberStats }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [searchCity, setSearchCity] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const { data, setField, errors, processing, post } = useFormWithErrors({
        name: group.name || '',
        description: group.description || '',
        city_id: group.city_id || null as number | null,
        max_members: group.max_members?.toString() || '',
        is_private: group.is_private || false,
        sports: group.sports.map(sport => ({
            id: sport.id,
            skill_level: sport.pivot?.skill_level || 'all',
        })),
        cover_photo: null as File | null,
    });

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        city.region.toLowerCase().includes(searchCity.toLowerCase())
    );

    const selectedCity = cities.find(c => c.id === data.city_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('groups.update', group.id), {
            transformData: (d) => {
                const formData = new FormData();
                formData.append('_method', 'PUT');
                formData.append('name', d.name);
                formData.append('description', d.description);
                if (d.city_id) formData.append('city_id', d.city_id.toString());
                formData.append('max_members', d.max_members);
                formData.append('is_private', d.is_private ? '1' : '0');
                d.sports.forEach((sport: { id: number; skill_level: string }, index: number) => {
                    formData.append(`sports[${index}][id]`, sport.id.toString());
                    formData.append(`sports[${index}][skill_level]`, sport.skill_level);
                });
                if (d.cover_photo) formData.append('cover_photo', d.cover_photo);
                return formData as any;
            },
        });
    };

    const handleSportAdd = (sportId: number) => {
        setField('sports', [...data.sports, { id: sportId, skill_level: 'all' }]);
    };

    const handleSportRemove = (sportId: number) => {
        setField('sports', data.sports.filter((s: { id: number }) => s.id !== sportId));
    };

    const handleSkillLevelChange = (sportId: number, skillLevel: string) => {
        setField('sports', data.sports.map((s: { id: number; skill_level: string }) =>
            s.id === sportId ? { ...s, skill_level: skillLevel } : s
        ));
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setField('cover_photo', e.target.files[0]);
        }
    };

    const availableSports = sports.filter(
        sport => !data.sports.some((s: { id: number }) => s.id === sport.id)
    );

    const isCreator = group.creator.id === user.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Iestatījumi - ${group.name} - SportMatch`} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={route('groups.show', group.id)}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-6 h-6" />
                            Grupas iestatījumi
                        </h1>
                        <p className="text-gray-600">{group.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pamata informācija</h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                {/* Group Name */}
                                <div className="grid gap-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Grupas nosaukums *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={e => setField('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                        required
                                        maxLength={50}
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div className="grid gap-1">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Apraksts
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setField('description', e.target.value)}
                                        rows={4}
                                        maxLength={500}
                                        placeholder="Apraksti savu grupu..."
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                {/* City */}
                                <div className="grid gap-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        Pilsēta *
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={selectedCity ? selectedCity.name : searchCity}
                                            onChange={(e) => {
                                                setSearchCity(e.target.value);
                                                setShowCityDropdown(true);
                                                if (!e.target.value) setField('city_id', null);
                                            }}
                                            onFocus={() => setShowCityDropdown(true)}
                                            placeholder="Meklēt pilsētu..."
                                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.city_id ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {showCityDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowCityDropdown(false)} />
                                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredCities.length > 0 ? filteredCities.map(city => (
                                                        <div
                                                            key={city.id}
                                                            onClick={() => {
                                                                setField('city_id', city.id);
                                                                setSearchCity(city.name);
                                                                setShowCityDropdown(false);
                                                            }}
                                                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${data.city_id === city.id ? 'bg-blue-50' : ''}`}
                                                        >
                                                            <div className="font-medium text-gray-900">{city.name}</div>
                                                            <div className="text-sm text-gray-500">{city.region} reģions</div>
                                                        </div>
                                                    )) : (
                                                        <div className="px-4 py-2 text-gray-500 text-sm">Nav atrasta pilsēta</div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {errors.city_id && <p className="text-sm text-red-600">{errors.city_id}</p>}
                                </div>

                                {/* Max Members & Privacy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="grid gap-1">
                                        <label htmlFor="max_members" className="block text-sm font-medium text-gray-700">
                                            Maksimālais dalībnieku skaits
                                        </label>
                                        <input
                                            id="max_members"
                                            type="number"
                                            value={data.max_members}
                                            onChange={e => setField('max_members', e.target.value)}
                                            min={memberStats.total_members.toString()}
                                            max="500"
                                            placeholder="Neierobežots"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.max_members ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.max_members && <p className="text-sm text-red-600">{errors.max_members}</p>}
                                        <p className="text-xs text-gray-500">Pašreiz: {memberStats.total_members} dalībnieki</p>
                                    </div>

                                    <div className="grid gap-1">
                                        <label className="block text-sm font-medium text-gray-700">Privātums</label>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="privacy"
                                                    checked={!data.is_private}
                                                    onChange={() => setField('is_private', false)}
                                                    className="h-4 w-4"
                                                />
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">Publiska grupa</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="privacy"
                                                    checked={data.is_private}
                                                    onChange={() => setField('is_private', true)}
                                                    className="h-4 w-4"
                                                />
                                                <Lock className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">Privāta grupa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Photo */}
                                <div className="grid gap-1">
                                    <label className="block text-sm font-medium text-gray-700">Galvenā bilde</label>
                                    <div className="flex items-center gap-4">
                                        {group.cover_photo_url && (
                                            <img src={group.cover_photo_url} alt="Pašreizējā bilde" className="w-20 h-12 object-cover rounded border" />
                                        )}
                                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">{group.cover_photo_url ? 'Mainīt bildi' : 'Augšupielādēt bildi'}</span>
                                            <input type="file" accept="image/*" onChange={handleCoverPhotoChange} className="hidden" />
                                        </label>
                                    </div>
                                    {data.cover_photo && (
                                        <p className="text-sm text-green-600">Izvēlēta jauna bilde: {data.cover_photo.name}</p>
                                    )}
                                    {errors.cover_photo && <p className="text-sm text-red-600">{errors.cover_photo}</p>}
                                </div>

                                {/* Sports */}
                                <div className="grid gap-1">
                                    <label className="block text-sm font-medium text-gray-700">Sporta veidi *</label>

                                    <div className="space-y-2 mb-2">
                                        {data.sports.map((selectedSport: { id: number; skill_level: string }) => {
                                            const sport = sports.find(s => s.id === selectedSport.id);
                                            if (!sport) return null;
                                            return (
                                                <div key={sport.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-lg">{sport.icon}</span>
                                                    <span className="font-medium flex-1">{sport.name}</span>
                                                    <select
                                                        value={selectedSport.skill_level}
                                                        onChange={e => handleSkillLevelChange(sport.id, e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
                                                    >
                                                        <option value="all">Visi līmeņi</option>
                                                        <option value="beginner">Iesācēji</option>
                                                        <option value="intermediate">Vidējais</option>
                                                        <option value="advanced">Augstākais</option>
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSportRemove(sport.id)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {availableSports.length > 0 && (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-3">Pievienot sporta veidu:</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {availableSports.map(sport => (
                                                    <button
                                                        key={sport.id}
                                                        type="button"
                                                        onClick={() => handleSportAdd(sport.id)}
                                                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        <span>{sport.icon}</span>
                                                        <span>{sport.name}</span>
                                                        <Plus className="w-3 h-3 ml-auto" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {errors.sports && <p className="text-sm text-red-600">{errors.sports}</p>}
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3 mt-2">
                                    <Link
                                        href={route('groups.show', group.id)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
                                    >
                                        Atcelt
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                                <span>Saglabā...</span>
                                            </>
                                        ) : (
                                            <span>Saglabāt izmaiņas</span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Statistics */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Grupas statistika</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Dalībnieki</span>
                                    </div>
                                    <span className="font-medium">{memberStats.total_members}</span>
                                </div>
                                {memberStats.pending_members > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 ml-6">Gaida apstiprinājumu</span>
                                        <span className="text-sm text-orange-600">{memberStats.pending_members}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Ieraksti</span>
                                    </div>
                                    <span className="font-medium">{memberStats.total_posts}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">Pasākumi</span>
                                    </div>
                                    <span className="font-medium">{memberStats.total_events}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 ml-6">Gaidāmi</span>
                                    <span className="text-sm text-green-600">{memberStats.upcoming_events}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Ātras darbības</h3>
                            <div className="space-y-3">
                                <Link
                                    href={route('groups.members', group.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Pārvaldīt dalībniekus</span>
                                </Link>
                                <Link
                                    href={route('groups.events', group.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Pasākumi</span>
                                </Link>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        {isCreator && (
                            <div className="bg-white border border-red-200 rounded-lg p-6">
                                <h3 className="font-semibold text-red-900 mb-4">Bīstama zona</h3>
                                <p className="text-sm text-red-700 mb-4">
                                    Šī darbība ir neatgriezeniska. Grupa un visi tās dati tiks dzēsti.
                                </p>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Dzēst grupu</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dzēst grupu?</h3>
                        <p className="text-gray-600 mb-4">
                            Šī darbība ir neatgriezeniska. Grupa "{group.name}" un visi tās dati tiks dzēsti:
                        </p>
                        <ul className="text-sm text-gray-600 mb-6 space-y-1">
                            <li>• {memberStats.total_members} dalībnieki</li>
                            <li>• {memberStats.total_posts} ieraksti</li>
                            <li>• {memberStats.total_events} pasākumi</li>
                            <li>• Visi komentāri un attēli</li>
                        </ul>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Atcelt
                            </button>
                            <Link
                                href={route('groups.destroy', group.id)}
                                method="delete"
                                as="button"
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-center"
                            >
                                Dzēst grupu
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
