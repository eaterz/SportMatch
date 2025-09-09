import React, { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Trophy, Zap, ChevronRight, ChevronLeft, Star, Check } from 'lucide-react';

import InputError from '@/components/input-error';

interface Sport {
    id: number;
    name: string;
    icon: string;
}

interface UserSport {
    sport_id: number;
    skill_level: 'beginner' | 'intermediate' | 'advanced';
    is_preferred: boolean;
    sport: Sport;
}

interface Props {
    sports: Sport[];
    userSports: Record<number, UserSport>;
    currentStep: number;
    totalSteps: number;
}

interface SelectedSport {
    sport_id: number;
    skill_level: 'beginner' | 'intermediate' | 'advanced';
    is_preferred: boolean;
}

export default function Step2({ sports, userSports, currentStep, totalSteps }: Props) {
    const [selectedSports, setSelectedSports] = useState<Record<number, SelectedSport>>(() => {
        const initial: Record<number, SelectedSport> = {};
        Object.values(userSports).forEach(userSport => {
            initial[userSport.sport_id] = {
                sport_id: userSport.sport_id,
                skill_level: userSport.skill_level,
                is_preferred: userSport.is_preferred
            };
        });
        return initial;
    });

    const toggleSport = (sportId: number) => {
        setSelectedSports(prev => {
            const newSelected = { ...prev };
            if (newSelected[sportId]) {
                delete newSelected[sportId];
            } else {
                newSelected[sportId] = {
                    sport_id: sportId,
                    skill_level: 'beginner',
                    is_preferred: false
                };
            }
            return newSelected;
        });
    };

    const updateSkillLevel = (sportId: number, skillLevel: 'beginner' | 'intermediate' | 'advanced') => {
        setSelectedSports(prev => ({
            ...prev,
            [sportId]: {
                ...prev[sportId],
                skill_level: skillLevel
            }
        }));
    };

    const togglePreferred = (sportId: number) => {
        setSelectedSports(prev => ({
            ...prev,
            [sportId]: {
                ...prev[sportId],
                is_preferred: !prev[sportId].is_preferred
            }
        }));
    };

    const selectedCount = Object.keys(selectedSports).length;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Profila iestatīšana - 2. solis" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600 text-sm">Izvēlies savus sporta veidus</p>
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
                            <Zap className="w-6 h-6 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Sporta veidi</h2>
                        <p className="text-gray-600 text-sm">Izvēlies vismaz vienu sportu</p>
                    </div>

                    <Form method="post" action={route('profile.setup.step2.store')}>
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                {/* Sports Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {sports.map(sport => (
                                        <div key={sport.id} className="relative">
                                            <div
                                                onClick={() => toggleSport(sport.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                                    selectedSports[sport.id]
                                                        ? 'border-green-500 bg-green-50'
                                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                                }`}
                                            >
                                                <div className="text-xl mb-2">{sport.icon}</div>
                                                <div className="text-xs font-medium text-gray-800">{sport.name}</div>
                                            </div>

                                            {selectedSports[sport.id] && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}

                                            {/* Hidden inputs with index for multiple sports */}
                                            {selectedSports[sport.id] && Object.keys(selectedSports).indexOf(String(sport.id)) !== -1 && (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        name={`sports[${Object.keys(selectedSports).indexOf(String(sport.id))}][sport_id]`}
                                                        value={sport.id}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name={`sports[${Object.keys(selectedSports).indexOf(String(sport.id))}][skill_level]`}
                                                        value={selectedSports[sport.id].skill_level}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name={`sports[${Object.keys(selectedSports).indexOf(String(sport.id))}][is_preferred]`}
                                                        value={selectedSports[sport.id].is_preferred ? '1' : '0'}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Selection Counter */}
                                {selectedCount > 0 && (
                                    <div className="text-center">
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                            {selectedCount} sporta veidi izvēlēti
                                        </span>
                                    </div>
                                )}

                                {/* Selected Sports Details */}
                                {selectedCount > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-3 text-sm">Norādi prasmes līmeni:</h3>
                                        <div className="space-y-3">
                                            {Object.values(selectedSports).map(selected => {
                                                const sport = sports.find(s => s.id === selected.sport_id);
                                                if (!sport) return null;

                                                return (
                                                    <div key={selected.sport_id} className="bg-white border border-gray-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-lg">{sport.icon}</span>
                                                                <span className="text-sm font-medium text-gray-900">{sport.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => togglePreferred(selected.sport_id)}
                                                                className={`p-1 rounded ${
                                                                    selected.is_preferred
                                                                        ? 'text-yellow-500'
                                                                        : 'text-gray-400 hover:text-gray-600'
                                                                }`}
                                                                title="Atzīmēt kā galveno sportu"
                                                            >
                                                                <Star
                                                                    className="w-4 h-4"
                                                                    fill={selected.is_preferred ? 'currentColor' : 'none'}
                                                                />
                                                            </button>
                                                        </div>

                                                        <div className="flex space-x-2">
                                                            {[
                                                                { key: 'beginner', label: 'Iesācējs' },
                                                                { key: 'intermediate', label: 'Vidējais' },
                                                                { key: 'advanced', label: 'Pieredzējis' }
                                                            ].map(level => (
                                                                <button
                                                                    key={level.key}
                                                                    type="button"
                                                                    onClick={() => updateSkillLevel(selected.sport_id, level.key as 'beginner' | 'intermediate' | 'advanced')}
                                                                    className={`flex-1 py-2 px-2 rounded text-xs font-medium border-2 ${
                                                                        selected.skill_level === level.key
                                                                            ? 'border-green-500 bg-green-500 text-white'
                                                                            : 'border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                                    }`}
                                                                >
                                                                    {level.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <InputError message={errors.sports} />

                                {/* Navigation */}
                                <div className="flex gap-3 pt-2">
                                    <a
                                        href={route('profile.setup.step1')}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border border-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Atpakaļ</span>
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing || selectedCount === 0}
                                        className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-500 disabled:text-gray-300 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
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
