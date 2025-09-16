import React from 'react';
import { Head, Form } from '@inertiajs/react';
import { Trophy, User, Calendar, Phone, MapPin, ChevronRight } from 'lucide-react';

import InputError from '@/components/input-error';

interface Profile {
    birth_date?: string; // <-- updated (ISO format: YYYY-MM-DD)
    phone?: string;
    gender?: 'male' | 'female';
    location?: string;
}

interface Props {
    profile: Profile;
    currentStep: number;
    totalSteps: number;
}

export default function Step1({ profile, currentStep, totalSteps }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Profila iestatīšana - 1. solis" />

            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600">Izveidosim tavu profilu</p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Solis {currentStep} no {totalSteps}</span>
                        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-black h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pamatinformācija</h2>
                        <p className="text-gray-600">Pastāsti mums nedaudz par sevi</p>
                    </div>

                    <Form
                        method="post"
                        action={route('profile.setup.step1.store')}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Dzimšanas datums */}
                                <div className="grid gap-2">
                                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Dzimšanas datums
                                    </label>
                                    <input
                                        id="birth_date"
                                        type="date"
                                        name="birth_date"
                                        defaultValue={profile.birth_date || ''}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                    />
                                    <InputError message={errors.birth_date} />
                                </div>

                                {/* Dzimums */}
                                <div className="grid gap-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Dzimums
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Male */}
                                        <label className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:border-gray-400 has-[:checked]:border-black has-[:checked]:bg-gray-200">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                defaultChecked={profile.gender === 'male'}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl mr-3">👨</span>
                                            <span className="font-medium">Vīrietis</span>
                                        </label>

                                        {/* Female */}
                                        <label className="flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer transition-all hover:border-gray-400 has-[:checked]:border-black has-[:checked]:bg-gray-200">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                defaultChecked={profile.gender === 'female'}
                                                className="sr-only"
                                            />
                                            <span className="text-2xl mr-3">👩</span>
                                            <span className="font-medium">Sieviete</span>
                                        </label>
                                    </div>
                                    <InputError message={errors.gender} />
                                </div>

                                {/* Atrašanās vieta */}
                                <div className="grid gap-2">
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        Atrašanās vieta
                                    </label>
                                    <input
                                        id="location"
                                        type="text"
                                        name="location"
                                        defaultValue={profile.location || ''}
                                        required
                                        placeholder="Piemēram: Rīga, Centrs"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                    />
                                    <InputError message={errors.location} />
                                </div>

                                {/* Telefons */}
                                <div className="grid gap-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Telefona numurs
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-100 text-gray-500">
                                            +371
                                        </span>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            defaultValue={profile.phone?.replace(/^\+?371/, '') || ''}
                                            placeholder="12345678"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:border-gray-400"
                                        />
                                    </div>
                                    <InputError message={errors.phone} />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                >
                                    {processing ? (
                                        <span>Saglabā...</span>
                                    ) : (
                                        <>
                                            <span>Turpināt</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </Form>
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
