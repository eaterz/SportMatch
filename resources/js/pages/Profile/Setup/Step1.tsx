import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, User, Calendar, Phone, MapPin, ChevronRight, Search } from 'lucide-react';
import { useFormWithErrors } from '@/hooks/useFormWithErrors';

interface City {
    id: number;
    name: string;
    region: string;
}

interface Profile {
    birth_date?: string;
    phone?: string;
    gender?: 'male' | 'female';
    location?: string;
    city_id?: number;
}

interface Props {
    profile: Profile;
    cities: City[];
    currentStep: number;
    totalSteps: number;
}

export default function Step1({ profile, cities = [], currentStep, totalSteps }: Props) {
    const [searchCity, setSearchCity] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const { data, setField, errors, processing, post } = useFormWithErrors({
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        city_id: profile.city_id || '',
        phone: profile.phone?.replace(/^\+?371/, '') || '',
    });

    const selectedCity = cities.find(c => c.id === Number(data.city_id));

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        city.region.toLowerCase().includes(searchCity.toLowerCase())
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profile/setup/step-1', {
            onSuccess: () => {
                window.location.href = '/profile/setup/step-2';
            }
        });
    };

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
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pamatinformācija</h2>
                        <p className="text-gray-600">Pastāsti mums nedaudz par sevi</p>
                    </div>

                    <form onSubmit={submit} className="flex flex-col gap-6">
                        {/* Dzimšanas datums */}
                        <div className="grid gap-2">
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Dzimšanas datums
                            </label>
                            <input
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={e => setField('birth_date', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.birth_date ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.birth_date && <p className="text-sm text-red-600">{errors.birth_date}</p>}
                        </div>

                        {/* Dzimums */}
                        <div className="grid gap-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <User className="w-4 h-4 inline mr-2" />
                                Dzimums
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-400 ${data.gender === 'male' ? 'border-black bg-gray-200' : 'border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={data.gender === 'male'}
                                        onChange={() => setField('gender', 'male')}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl mr-3">👨</span>
                                    <span className="font-medium">Vīrietis</span>
                                </label>

                                <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-gray-400 ${data.gender === 'female' ? 'border-black bg-gray-200' : 'border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={data.gender === 'female'}
                                        onChange={() => setField('gender', 'female')}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl mr-3">👩</span>
                                    <span className="font-medium">Sieviete</span>
                                </label>
                            </div>
                            {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
                        </div>

                        {/* Pilsēta */}
                        <div className="grid gap-2">
                            <label className="block text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Pilsēta
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={selectedCity ? selectedCity.name : searchCity}
                                    onChange={(e) => {
                                        setSearchCity(e.target.value);
                                        setShowDropdown(true);
                                        if (!e.target.value) {
                                            setField('city_id', '');
                                        }
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Meklēt pilsētu..."
                                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.city_id ? 'border-red-500' : 'border-gray-300'}`}
                                />

                                {showDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCities.length > 0 ? (
                                                filteredCities.map(city => (
                                                    <div
                                                        key={city.id}
                                                        onClick={() => {
                                                            setField('city_id', city.id);
                                                            setSearchCity(city.name);
                                                            setShowDropdown(false);
                                                        }}
                                                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${Number(data.city_id) === city.id ? 'bg-blue-50' : ''}`}
                                                    >
                                                        <div className="font-medium text-gray-900">{city.name}</div>
                                                        <div className="text-sm text-gray-500">{city.region} reģions</div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm">Nav atrasta pilsēta</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.city_id && <p className="text-sm text-red-600">{errors.city_id}</p>}
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
                                    value={data.phone}
                                    onChange={e => setField('phone', e.target.value)}
                                    placeholder="12345678"
                                    className={`flex-1 px-3 py-2 border rounded-md rounded-l-none focus:outline-none focus:border-gray-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                />
                            </div>
                            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing || !data.city_id}
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
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500">© 2025 SportMatch</p>
                </div>
            </div>
        </div>
    );
}
