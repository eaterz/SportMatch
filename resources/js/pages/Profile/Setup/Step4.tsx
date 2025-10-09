import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Trophy, Camera, ChevronRight, ChevronLeft, Upload, Trash2, Star, Check, X } from 'lucide-react';

interface Photo {
    id: number;
    photo_url: string;
    is_main: boolean;
}

interface Props {
    photos: Photo[];
    currentStep: number;
    totalSteps: number;
}

export default function Step4({ photos = [], currentStep, totalSteps }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setUploadError('Lūdzu izvēlies attēlu!');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Attēls ir pārāk liels! Maksimālais izmērs: 5MB');
            return;
        }

        if (photos.length >= 3) {
            setUploadError('Maksimums 3 fotogrāfijas!');
            return;
        }

        setUploadError('');
        setIsUploading(true);

        const formData = new FormData();
        formData.append('photo', file);

        router.post('/profile/setup/photo/upload', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setIsUploading(false);
            },
            onError: () => {
                setUploadError('Kļūda augšupielādējot foto');
                setIsUploading(false);
            }
        });
    };

    const deletePhoto = (photoId: number) => {
        if (confirm('Vai tiešām vēlies dzēst šo foto?')) {
            router.delete(`/profile/setup/photo/${photoId}`, {
                preserveScroll: true
            });
        }
    };

    const setMainPhoto = (photoId: number) => {
        router.post(`/profile/setup/photo/${photoId}/main`, {}, {
            preserveScroll: true
        });
    };

    const handleContinue = () => {
        if (photos.length === 0) {
            setUploadError('Jāpievieno vismaz viena fotogrāfija!');
            return;
        }
        router.post('/profile/setup/step-4');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Profila iestatīšana - 4. solis" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600 text-sm">Pievieno savas fotogrāfijas</p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Solis {currentStep} no {totalSteps}</span>
                        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-black h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Camera className="w-6 h-6 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Profila fotogrāfijas</h2>
                        <p className="text-gray-600 text-sm">Pievieno 1-3 fotogrāfijas</p>
                    </div>

                    <div className="space-y-4">
                        {/* Photo Grid */}
                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative group aspect-square">
                                        <img
                                            src={photo.photo_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                        />

                                        {/* Main badge */}
                                        {photo.is_main && (
                                            <div className="absolute top-1 left-1 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                                                Galvenā
                                            </div>
                                        )}

                                        {/* Hover actions */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center gap-2">
                                            {!photo.is_main && (
                                                <button
                                                    onClick={() => setMainPhoto(photo.id)}
                                                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-all"
                                                    title="Iestatīt kā galveno"
                                                >
                                                    <Star className="w-4 h-4 text-gray-700" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deletePhoto(photo.id)}
                                                className="p-2 bg-white rounded-lg hover:bg-red-50 transition-all"
                                                title="Dzēst"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add more button if less than 3 */}
                                {photos.length < 3 && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">Pievienot</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Initial upload area (when no photos) */}
                        {photos.length === 0 && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Camera className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-2">Pievieno savu foto</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Profili ar fotogrāfijām saņem 10x vairāk uzmanības!
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-all disabled:opacity-50"
                                >
                                    {isUploading ? 'Augšupielādē...' : 'Izvēlēties foto'}
                                </button>
                            </div>
                        )}

                        {/* Upload error */}
                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-red-800">{uploadError}</p>
                                </div>
                            </div>
                        )}

                        {/* Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Padomi labām fotogrāfijām:</h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li className="flex items-start gap-2">
                                    <Check className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Skaidra seja un labi apgaismojums</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Sportisks apģērbs vai aktivitāšu foto</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>Izvairīties no grupas foto</span>
                                </li>
                            </ul>
                        </div>

                        {/* Photo counter */}
                        <div className="text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                photos.length > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {photos.length} / 3 fotogrāfijas
                            </span>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {/* Navigation */}
                        <div className="flex gap-3 pt-2">
                            <a
                                href={route('profile.setup.step3')}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border border-gray-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Atpakaļ</span>
                            </a>
                            <button
                                onClick={handleContinue}
                                disabled={photos.length === 0 || isUploading}
                                className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-500 disabled:text-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                            >
                                <span>Turpināt</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">
                        © 2025 SportMatch
                    </p>
                </div>
            </div>
        </div>
    );
}
