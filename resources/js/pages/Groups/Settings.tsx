import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Settings, Users, MessageSquare, Calendar,
    Trash2, Upload, X, Lock, Globe, Plus
} from 'lucide-react';

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

interface Group {
    id: number;
    name: string;
    description?: string;
    location?: string;
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
    memberStats: MemberStats;
}

export default function GroupSettings({ user, group, sports, memberStats }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedSports, setSelectedSports] = useState(
        group.sports.map(sport => ({
            id: sport.id,
            skill_level: sport.pivot?.skill_level || 'all'
        }))
    );

    const { data, setData, post, processing, errors } = useForm({
        name: group.name || '',
        description: group.description || '',
        location: group.location || '',
        max_members: group.max_members?.toString() || '',
        is_private: group.is_private || false,
        sports: selectedSports,
        cover_photo: null as File | null,
        _method: 'PUT'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('groups.update', group.id), {
            forceFormData: true,
        });
    };

    const handleSportAdd = (sportId: number) => {
        const newSport = { id: sportId, skill_level: 'all' };
        const updatedSports = [...selectedSports, newSport];
        setSelectedSports(updatedSports);
        setData('sports', updatedSports);
    };

    const handleSportRemove = (sportId: number) => {
        const updatedSports = selectedSports.filter(s => s.id !== sportId);
        setSelectedSports(updatedSports);
        setData('sports', updatedSports);
    };

    const handleSkillLevelChange = (sportId: number, skillLevel: string) => {
        const updatedSports = selectedSports.map(s =>
            s.id === sportId ? { ...s, skill_level: skillLevel } : s
        );
        setSelectedSports(updatedSports);
        setData('sports', updatedSports);
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('cover_photo', e.target.files[0]);
        }
    };

    const availableSports = sports.filter(
        sport => !selectedSports.some(s => s.id === sport.id)
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
                        {/* Basic Information */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pamata informācija</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Group Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Grupas nosaukums *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Apraksts
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                        placeholder="Apraksti savu grupu..."
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                        Atrašanās vieta
                                    </label>
                                    <input
                                        type="text"
                                        id="location"
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                        placeholder="Pilsēta vai reģions"
                                    />
                                    {errors.location && (
                                        <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                    )}
                                </div>

                                {/* Max Members & Privacy */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="max_members" className="block text-sm font-medium text-gray-700 mb-2">
                                            Maksimālais dalībnieku skaits
                                        </label>
                                        <input
                                            type="number"
                                            id="max_members"
                                            value={data.max_members}
                                            onChange={e => setData('max_members', e.target.value)}
                                            min={memberStats.total_members.toString()}
                                            max="500"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                            placeholder="Neierobežots"
                                        />
                                        {errors.max_members && (
                                            <p className="mt-1 text-sm text-red-600">{errors.max_members}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Pašreiz: {memberStats.total_members} dalībnieki
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Privātums
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="privacy"
                                                    checked={!data.is_private}
                                                    onChange={() => setData('is_private', false)}
                                                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                                />
                                                <Globe className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                                                <span className="text-sm text-gray-700">Publiska grupa</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="privacy"
                                                    checked={data.is_private}
                                                    onChange={() => setData('is_private', true)}
                                                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                                                />
                                                <Lock className="w-4 h-4 ml-2 mr-1 text-gray-500" />
                                                <span className="text-sm text-gray-700">Privāta grupa</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Photo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Galvenā bilde
                                    </label>
                                    <div className="flex items-center gap-4">
                                        {group.cover_photo_url && (
                                            <img
                                                src={group.cover_photo_url}
                                                alt="Pašreizējā bilde"
                                                className="w-20 h-12 object-cover rounded border"
                                            />
                                        )}
                                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">
                                                {group.cover_photo_url ? 'Mainīt bildi' : 'Augšupielādēt bildi'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCoverPhotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    {data.cover_photo && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Izvēlēta jauna bilde: {data.cover_photo.name}
                                        </p>
                                    )}
                                    {errors.cover_photo && (
                                        <p className="mt-1 text-sm text-red-600">{errors.cover_photo}</p>
                                    )}
                                </div>

                                {/* Sports */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sporta veidi *
                                    </label>

                                    {/* Selected Sports */}
                                    <div className="space-y-3 mb-4">
                                        {selectedSports.map(selectedSport => {
                                            const sport = sports.find(s => s.id === selectedSport.id);
                                            if (!sport) return null;

                                            return (
                                                <div key={sport.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-lg">{sport.icon}</span>
                                                    <span className="font-medium flex-1">{sport.name}</span>
                                                    <select
                                                        value={selectedSport.skill_level}
                                                        onChange={e => handleSkillLevelChange(sport.id, e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
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

                                    {/* Add Sports */}
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

                                    {errors.sports && (
                                        <p className="mt-1 text-sm text-red-600">{errors.sports}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4 pt-4">
                                    <Link
                                        href={route('groups.show', group.id)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                                    >
                                        Atcelt
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                    >
                                        {processing ? 'Saglabā...' : 'Saglabāt izmaiņas'}
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

                        {/* Danger Zone (Creator only) */}
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
