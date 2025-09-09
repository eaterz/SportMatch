import React, { useState } from 'react';
import { Head, Form, Link } from '@inertiajs/react';
import { User, Mail, Shield, Trash2, Save, AlertTriangle } from 'lucide-react';

import Navbar from '@/components/navbar';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    email_verified_at?: string;
}

interface Props {
    user: User;
    mustVerifyEmail?: boolean;
    status?: string;
}

export default function ProfileSettings({ user, mustVerifyEmail = false, status }: Props) {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profila iestatījumi - SportMatch" />

            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profila iestatījumi</h1>
                    <p className="text-gray-600">Pārvaldi savu SportMatch profilu un kontu</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <User className="w-4 h-4 inline mr-2" />
                                Profila informācija
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'security'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Shield className="w-4 h-4 inline mr-2" />
                                Drošība
                            </button>
                            <button
                                onClick={() => setActiveTab('danger')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'danger'
                                        ? 'border-red-500 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <Trash2 className="w-4 h-4 inline mr-2" />
                                Dzēst kontu
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Profile Information Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personālā informācija</h3>
                                    <p className="text-gray-600 mb-6">Atjauno savu vārdu un e-pasta adresi</p>
                                </div>

                                <Form
                                    method="patch"
                                    action={route('profile.update')}
                                    className="space-y-6"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            {/* Name Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Vārds
                                                    </label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        name="name"
                                                        defaultValue={user.name}
                                                        required
                                                        autoComplete="given-name"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                    />
                                                    <InputError message={errors.name} />
                                                </div>

                                                <div>
                                                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                                                        Uzvārds
                                                    </label>
                                                    <input
                                                        id="lastname"
                                                        type="text"
                                                        name="lastname"
                                                        defaultValue={user.lastname || ''}
                                                        autoComplete="family-name"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                    />
                                                    <InputError message={errors.lastname} />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Mail className="w-4 h-4 inline mr-2" />
                                                    E-pasta adrese
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    defaultValue={user.email}
                                                    required
                                                    autoComplete="email"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                />
                                                <InputError message={errors.email} />

                                                {/* Email Verification */}
                                                {mustVerifyEmail && !user.email_verified_at && (
                                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                                                            <span className="text-sm text-yellow-800">
                                                                Tavs e-pasts nav apstiprināts.
                                                            </span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <Link
                                                                href={route('verification.send')}
                                                                method="post"
                                                                as="button"
                                                                className="text-sm text-yellow-700 underline hover:text-yellow-800"
                                                            >
                                                                Nosūtīt apstiprinājuma e-pastu
                                                            </Link>
                                                        </div>
                                                        {status === 'verification-link-sent' && (
                                                            <div className="mt-2 text-sm text-green-600">
                                                                Apstiprinājuma saite nosūtīta uz tavu e-pastu.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Save Button */}
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center space-x-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    <span>{processing ? 'Saglabā...' : 'Saglabāt'}</span>
                                                </button>

                                                {recentlySuccessful && (
                                                    <span className="text-sm text-green-600">Saglabāts!</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Drošības iestatījumi</h3>
                                    <p className="text-gray-600 mb-6">Maini savu paroli un citus drošības iestatījumus</p>
                                </div>

                                <Form
                                    method="put"
                                    action={route('password.update')}
                                    className="space-y-6"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            <div>
                                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Pašreizējā parole
                                                </label>
                                                <input
                                                    id="current_password"
                                                    type="password"
                                                    name="current_password"
                                                    autoComplete="current-password"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                />
                                                <InputError message={errors.current_password} />
                                            </div>

                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Jaunā parole
                                                </label>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    autoComplete="new-password"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div>
                                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Apstiprini jauno paroli
                                                </label>
                                                <input
                                                    id="password_confirmation"
                                                    type="password"
                                                    name="password_confirmation"
                                                    autoComplete="new-password"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                                                />
                                                <InputError message={errors.password_confirmation} />
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center space-x-2"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    <span>{processing ? 'Atjauno...' : 'Atjaunot paroli'}</span>
                                                </button>

                                                {recentlySuccessful && (
                                                    <span className="text-sm text-green-600">Parole atjaunota!</span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        )}

                        {/* Danger Zone Tab */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600 mb-2">Bīstamā zona</h3>
                                    <p className="text-gray-600 mb-6">Šīs darbības ir neatgriezeniskas</p>
                                </div>

                                <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="text-lg font-medium text-red-900 mb-2">Dzēst kontu</h4>
                                            <p className="text-red-700 mb-4">
                                                Pēc konta dzēšanas visi tavi dati tiks neatgriezeniski izdzēsti.
                                                Pirms konta dzēšanas, lūdzu, lejupielādē visus datus vai informāciju,
                                                ko vēlies saglabāt.
                                            </p>
                                            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2">
                                                <Trash2 className="w-4 h-4" />
                                                <span>Dzēst kontu</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
