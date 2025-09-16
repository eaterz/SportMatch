import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, MapPin, Users, Lock, Globe, Plus, X } from 'lucide-react';

interface Sport {
    id: number;
    name: string;
    icon: string;
}

interface SportSelection {
    id: number;
    skill_level: string;
}

interface Props {
    sports: Sport[];
}

export default function GroupsCreate({ sports = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        location: '',
        max_members: '',
        is_private: false,
        sports: [] as SportSelection[],
        cover_photo: null as File | null,
    });

    const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('location', data.location);
        formData.append('max_members', data.max_members);
        formData.append('is_private', data.is_private ? '1' : '0');

        // Pievieno sporta veidus
        data.sports.forEach((sport, index) => {
            formData.append(`sports[${index}][id]`, sport.id.toString());
            formData.append(`sports[${index}][skill_level]`, sport.skill_level);
        });

        if (data.cover_photo) {
            formData.append('cover_photo', data.cover_photo);
        }

        router.post('/groups', formData, {
            forceFormData: true,
        });
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('cover_photo', file);

            // Izveido priekšskatījumu
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSport = (sportId: number) => {
        if (!data.sports.find(s => s.id === sportId)) {
            setData('sports', [...data.sports, { id: sportId, skill_level: 'all' }]);
        }
    };

    const removeSport = (sportId: number) => {
        setData('sports', data.sports.filter(s => s.id !== sportId));
    };

    const updateSportSkillLevel = (sportId: number, skillLevel: string) => {
        setData('sports', data.sports.map(s =>
            s.id === sportId ? { ...s, skill_level: skillLevel } : s
        ));
    };

    const getSelectedSport = (sportId: number) => {
        return sports.find(s => s.id === sportId);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Izveidot grupu - SportMatch" />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.get('/groups')}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Izveidot jaunu grupu</h1>
                        <p className="text-gray-600">Izveido savu sporta grupu un uzaicini draugus</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover foto */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                            Grupas attēls
                        </label>
                        <div className="relative">
                            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
                                {coverPhotoPreview ? (
                                    <img
                                        src={coverPhotoPreview}
                                        alt="Cover preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <Upload className="w-12 h-12 mb-2" />
                                        <span className="text-sm">Noklikšķini, lai augšupielādētu</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverPhotoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        {errors.cover_photo && (
                            <p className="mt-2 text-sm text-red-600">{errors.cover_photo}</p>
                        )}
                    </div>

                    {/* Pamatinformācija */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pamatinformācija</h2>

                        <div className="space-y-4">
                            {/* Nosaukums */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grupas nosaukums *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Rīgas basketbola entuziasti"
                                    maxLength={100}
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Apraksts */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Apraksts
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                    placeholder="Apraksti savu grupu..."
                                    rows={4}
                                    maxLength={500}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {data.description.length}/500
                                </p>
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            {/* Atrašanās vieta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="inline w-4 h-4 mr-1" />
                                    Atrašanās vieta
                                </label>
                                <input
                                    type="text"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Rīga, Latvija"
                                    maxLength={100}
                                />
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                                )}
                            </div>

                            {/* Maksimālais dalībnieku skaits */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="inline w-4 h-4 mr-1" />
                                    Maksimālais dalībnieku skaits
                                </label>
                                <input
                                    type="number"
                                    value={data.max_members}
                                    onChange={e => setData('max_members', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Neierobežots"
                                    min="2"
                                    max="100"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Atstāj tukšu neierobežotam skaitam
                                </p>
                                {errors.max_members && (
                                    <p className="mt-1 text-sm text-red-600">{errors.max_members}</p>
                                )}
                            </div>

                            {/* Privātums */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Grupas tips
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!data.is_private}
                                            onChange={() => setData('is_private', false)}
                                            className="w-4 h-4"
                                        />
                                        <Globe className="w-4 h-4" />
                                        <span>Publiska</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={data.is_private}
                                            onChange={() => setData('is_private', true)}
                                            className="w-4 h-4"
                                        />
                                        <Lock className="w-4 h-4" />
                                        <span>Privāta</span>
                                    </label>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    {data.is_private
                                        ? 'Jaunie dalībnieki būs jāapstiprina manuāli'
                                        : 'Ikviens varēs pievienoties grupai'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sporta veidi */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Sporta veidi *
                        </h2>

                        {/* Izvēlētie sporta veidi */}
                        {data.sports.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {data.sports.map(sport => {
                                    const sportInfo = getSelectedSport(sport.id);
                                    if (!sportInfo) return null;

                                    return (
                                        <div key={sport.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <span className="text-xl">{sportInfo.icon}</span>
                                            <span className="font-medium flex-1">{sportInfo.name}</span>
                                            <select
                                                value={sport.skill_level}
                                                onChange={e => updateSportSkillLevel(sport.id, e.target.value)}
                                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                                            >
                                                <option value="all">Visi līmeņi</option>
                                                <option value="beginner">Iesācēji</option>
                                                <option value="intermediate">Vidējais</option>
                                                <option value="advanced">Pieredzējuši</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => removeSport(sport.id)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Sporta veidu izvēle */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {sports.map(sport => {
                                const isSelected = data.sports.find(s => s.id === sport.id);
                                return (
                                    <button
                                        key={sport.id}
                                        type="button"
                                        onClick={() => !isSelected && addSport(sport.id)}
                                        disabled={!!isSelected}
                                        className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                                            isSelected
                                                ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                                                : 'border-gray-300 hover:border-black hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{sport.icon}</span>
                                        <span className="text-sm">{sport.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {errors.sports && (
                            <p className="mt-2 text-sm text-red-600">{errors.sports}</p>
                        )}

                        {data.sports.length === 0 && (
                            <p className="mt-2 text-sm text-gray-500">
                                Izvēlies vismaz vienu sporta veidu
                            </p>
                        )}
                    </div>

                    {/* Pogas */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.get('/groups')}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={processing}
                        >
                            Atcelt
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.sports.length === 0 || !data.name.trim()}
                            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {processing ? 'Izveido...' : 'Izveidot grupu'}
                        </button>
                    </div>

                    {/* Kļūdu ziņojumi */}
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-red-800 mb-2">
                                Lūdzu novērsiet šādas kļūdas:
                            </h3>
                            <ul className="text-sm text-red-700 space-y-1">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>• {message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
