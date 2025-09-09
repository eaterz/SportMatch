import React, { useState } from 'react';
import { Head, Form } from '@inertiajs/react';
import { Trophy, Clock, ChevronRight, ChevronLeft, Check } from 'lucide-react';

import InputError from '@/components/input-error';

interface Props {
    currentStep: number;
    totalSteps: number;
}

interface AvailabilitySlot {
    day: string;
    startTime: string;
    endTime: string;
}

export default function Step3({ currentStep, totalSteps }: Props) {
    const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({});
    const [timeSlots, setTimeSlots] = useState<Record<string, { start: string; end: string }>>({});

    const daysOfWeek = [
        { key: 'monday', label: 'Pirmdiena' },
        { key: 'tuesday', label: 'Otrdiena' },
        { key: 'wednesday', label: 'Trešdiena' },
        { key: 'thursday', label: 'Ceturtdiena' },
        { key: 'friday', label: 'Piektdiena' },
        { key: 'saturday', label: 'Sestdiena' },
        { key: 'sunday', label: 'Svētdiena' }
    ];

    const timeOptions = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ];

    const toggleDay = (day: string) => {
        setSelectedDays(prev => {
            const newSelected = { ...prev };
            if (newSelected[day]) {
                delete newSelected[day];
                // Remove time slot when day is deselected
                setTimeSlots(prev => {
                    const newSlots = { ...prev };
                    delete newSlots[day];
                    return newSlots;
                });
            } else {
                newSelected[day] = true;
                // Set default time when day is selected
                setTimeSlots(prev => ({
                    ...prev,
                    [day]: { start: '09:00', end: '18:00' }
                }));
            }
            return newSelected;
        });
    };

    const updateTimeSlot = (day: string, field: 'start' | 'end', value: string) => {
        setTimeSlots(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const selectedCount = Object.keys(selectedDays).length;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Profila iestatīšana - 3. solis" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600 text-sm">Kad vari sportot?</p>
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
                            <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Pieejamība</h2>
                        <p className="text-gray-600 text-sm">Norādi, kad parasti vari sportot</p>
                    </div>

                    <Form method="post" action={route('profile.setup.step3.store')}>
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                {/* Days Selection */}
                                <div className="space-y-3">
                                    {daysOfWeek.map(day => (
                                        <div key={day.key} className="border border-gray-200 rounded-lg p-3">
                                            {/* Day Toggle */}
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="flex items-center cursor-pointer">
                                                    <div
                                                        onClick={() => toggleDay(day.key)}
                                                        className={`w-5 h-5 border-2 rounded cursor-pointer flex items-center justify-center transition-all ${
                                                            selectedDays[day.key]
                                                                ? 'border-blue-500 bg-blue-500'
                                                                : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                    >
                                                        {selectedDays[day.key] && (
                                                            <Check className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                    <span className="ml-3 font-medium text-gray-900">{day.label}</span>
                                                </label>
                                            </div>

                                            {/* Time Selection */}
                                            {selectedDays[day.key] && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">No:</label>
                                                        <select
                                                            value={timeSlots[day.key]?.start || '09:00'}
                                                            onChange={(e) => updateTimeSlot(day.key, 'start', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
                                                        >
                                                            {timeOptions.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Līdz:</label>
                                                        <select
                                                            value={timeSlots[day.key]?.end || '18:00'}
                                                            onChange={(e) => updateTimeSlot(day.key, 'end', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
                                                        >
                                                            {timeOptions.map(time => (
                                                                <option key={time} value={time}>{time}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hidden inputs */}
                                            {selectedDays[day.key] && timeSlots[day.key] && (
                                                <>
                                                    <input type="hidden" name={`schedule[${day.key}][day]`} value={day.key} />
                                                    <input type="hidden" name={`schedule[${day.key}][start_time]`} value={timeSlots[day.key].start} />
                                                    <input type="hidden" name={`schedule[${day.key}][end_time]`} value={timeSlots[day.key].end} />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Selection Summary */}
                                {selectedCount > 0 && (
                                    <div className="text-center">
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                            {selectedCount} dienas izvēlētas
                                        </span>
                                    </div>
                                )}

                                <InputError message={errors.schedule} />

                                {/* Navigation */}
                                <div className="flex gap-3 pt-2">
                                    <a
                                        href={route('profile.setup.step2')}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 border border-gray-400"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Atpakaļ</span>
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
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
