import React, { useState, useRef } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Camera, Trash2, Star, Edit2, Upload, MapPin, Phone, Mail, User } from 'lucide-react';
import Navbar from '@/components/navbar';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    profile?: {
        age?: number;
        location?: string;
        phone?: string;
        bio?: string;
        gender?: string;
        main_photo?: string;
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
}

export default function ProfileShow({ user, photos = [] }: Props) {
    const [editingBio, setEditingBio] = useState(false);
    const [editingInfo, setEditingInfo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: bioData, setData: setBioData, post: postBio, processing: processingBio } = useForm({
        bio: user.profile?.bio || ''
    });

    const { data: infoData, setData: setInfoData, post: postInfo, processing: processingInfo } = useForm({
        phone: user.profile?.phone || '',
        location: user.profile?.location || '',
        bio: user.profile?.bio || ''
    });

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

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start -mt-16 space-y-4 md:space-y-0 md:space-x-6">
                            {/* Profile Photo */}
                            <div className="relative">
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
                            <div className="flex-1 text-center md:text-left mt-4 md:mt-8">
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    {user.name} {user.lastname}
                                </h1>

                                {editingInfo ? (
                                    <div className="space-y-3 max-w-md">
                                        <input
                                            type="text"
                                            value={infoData.location}
                                            onChange={e => setInfoData('location', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Atrašanās vieta"
                                        />
                                        <input
                                            type="text"
                                            value={infoData.phone}
                                            onChange={e => setInfoData('phone', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Telefona numurs"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={saveInfo}
                                                disabled={processingInfo}
                                                className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
                                            >
                                                Saglabāt
                                            </button>
                                            <button
                                                onClick={() => setEditingInfo(false)}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                            >
                                                Atcelt
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600">
                                            <div className="flex items-center justify-center md:justify-start space-x-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.email}</span>
                                            </div>
                                            {user.profile?.location && (
                                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{user.profile.location}</span>
                                                </div>
                                            )}
                                            {user.profile?.phone && (
                                                <div className="flex items-center justify-center md:justify-start space-x-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{user.profile.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setEditingInfo(true)}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Par mani</h2>
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
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                                            >
                                                Saglabāt
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingBio(false);
                                                    setBioData('bio', user.profile?.bio || '');
                                                }}
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                            >
                                                Atcelt
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-600 leading-relaxed">
                                    {user.profile?.bio ||
                                        <span className="text-gray-400 italic">Nav pievienots apraksts. Noklikšķini uz zīmuļa, lai pievienotu!</span>
                                    }
                                </p>
                            )}
                        </div>

                        {/* Photo Gallery */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Foto galerija</h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-xl hover:shadow-lg transition-all"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Pievienot</span>
                                </button>
                            </div>

                            {photos.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {photos.map(photo => (
                                        <div key={photo.id} className="relative group aspect-square">
                                            <img
                                                src={photo.photo_url || `/storage/${photo.photo_path}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-end justify-center pb-3 space-x-2">
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
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                        <Camera className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-4">Nav pievienotu bilžu</p>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Pievienot pirmo bildi
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Sports */}
                    <div className="space-y-8">
                        {user.sports && user.sports.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Mani sporta veidi</h2>
                                <div className="space-y-3">
                                    {user.sports.map(sport => (
                                        <div key={sport.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{sport.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{sport.name}</p>
                                                    {sport.pivot && (
                                                        <p className="text-sm text-gray-600">
                                                            {getSkillLevelLabel(sport.pivot.skill_level)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {sport.pivot?.is_preferred ? (
                                                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                                            ):null}
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
