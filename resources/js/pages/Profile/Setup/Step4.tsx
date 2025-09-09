import React, { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Trophy, User, ChevronLeft, Check } from 'lucide-react';

import InputError from '@/components/input-error';

interface Profile {
    bio?: string;
}

interface Props {
    profile: Profile;
    currentStep: number;
    totalSteps: number;
}

export default function Step4({ profile, currentStep, totalSteps }: Props) {
    const [bio, setBio] = useState(profile.bio || '');

    const maxChars = 500;
    const remainingChars = maxChars - bio.length;

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
                    <p className="text-gray-600 text-sm">Pēdējais solis!</p>
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
                            <User className="w-6 h-6 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Par tevi</h2>
                        <p className="text-gray-600 text-sm">Pastāsti nedaudz par sevi un saviem mērķiem</p>
                    </div>

                    <Form method="post" action={route('profile.setup.step4.store')}>
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                {/* Bio Input */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Apraksts <span className="text-gray-400">(neobligāts)</span>
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={4}
                                        maxLength={maxChars}
                                        placeholder="Piemēram: Mīlu aktīvu dzīvesveidu un meklēju sporta partnerus nedēļas nogalēm. Vislabāk patīk teniss un skrējieni parkā..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 resize-none"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-xs text-gray-500">
                                            Palīdz citiem labāk tevi iepazīt
                                        </div>
                                        <div className={`text-xs ${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {remainingChars} rakstzīmes atlikušas
                                        </div>
                                    </div>
                                    <InputError message={errors.bio} />
                                </div>

                                {/* Profile Complete Info */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-green-800 mb-1">
                                                Profils gandrīz gatavs!
                                            </h4>
                                            <p className="text-sm text-green-700">
                                                Pēc pabeigšanas varēsi sākt meklēt sporta partnerus un pievienoties aktivitātēm.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Features Preview */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Ko varēsi darīt SportMatch:</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Atrast sporta partnerus tuvumā</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Pievienoties sporta aktivitātēm</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Organizēt savas sporta sesijas</span>
                                        </div>
                                    </div>
                                </div>

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
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:text-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                                    >
                                        {processing ? (
                                            <span>Pabeigt...</span>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Pabeigt profilu</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
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
