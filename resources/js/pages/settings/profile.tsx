import React, { useState } from 'react';
import { Head, Form, Link, router } from '@inertiajs/react';
import {
    User, Mail, Shield, Trash2, Save, AlertTriangle,
    Info, Lock, X, CheckCircle, Clock, Bell
} from 'lucide-react';

import Navbar from '@/components/navbar';
import InputError from '@/components/input-error';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    email_verified_at?: string;
    oauth_provider?: string | null;
    pending_email?: string | null;
}

interface Props {
    user: User;
    mustVerifyEmail?: boolean;
    status?: string;
}

export default function ProfileSettings({ user, mustVerifyEmail = false, status }: Props) {
    const [activeTab, setActiveTab] = useState('profile');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isOAuthUser = user.oauth_provider !== null && user.oauth_provider !== undefined;

    const handleDeleteAccount = () => {
        setIsDeleting(true);
        router.delete(route('profile.settings.destroy'), {
            preserveScroll: true,
            onSuccess: () => router.visit('/'),
            onFinish: () => setIsDeleting(false),
        });
    };

    const tabs = [
        { key: 'profile', label: 'Profila informācija', icon: User, danger: false },
        { key: 'security', label: 'Drošība', icon: Shield, danger: false },
        { key: 'danger', label: 'Dzēst kontu', icon: Trash2, danger: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profila iestatījumi - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Profila iestatījumi</h1>
                    <p className="text-gray-500">Pārvaldi savu SportMatch profilu un kontu</p>
                </div>

                {/* Global status messages */}
                {status === 'email-updated' && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 font-medium">E-pasta adrese veiksmīgi atjaunināta!</p>
                    </div>
                )}
                {status === 'email-change-cancelled' && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-xl">
                        <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <p className="text-sm text-gray-700">E-pasta maiņa atcelta. Tiek izmantots iepriekšējais e-pasts.</p>
                    </div>
                )}
                {status === 'profile-updated' && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm text-green-800 font-medium">Profils veiksmīgi saglabāts!</p>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 bg-gray-50/50">
                        <nav className="flex px-6 gap-1">
                            {tabs.map(({ key, label, icon: Icon, danger }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={`flex items-center gap-2 py-4 px-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                                        activeTab === key
                                            ? danger
                                                ? 'border-red-500 text-red-600'
                                                : 'border-gray-900 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6 md:p-8">

                        {/* ── PROFILE TAB ── */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Personālā informācija</h3>
                                    <p className="text-sm text-gray-500 mt-1">Atjauno savu vārdu un e-pasta adresi</p>
                                </div>

                                {/* Pending email banner */}
                                {user.pending_email && (
                                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                        <Bell className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-amber-800">
                                                Gaida e-pasta apstiprinājumu
                                            </p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Apstiprinājuma saite nosūtīta uz{' '}
                                                <strong className="font-semibold">{user.pending_email}</strong>.
                                                Pašreizējais e-pasts{' '}
                                                <strong className="font-semibold">{user.email}</strong>{' '}
                                                paliek aktīvs līdz apstiprināšanai.
                                            </p>
                                        </div>
                                        <Link
                                            href={route('profile.email.cancel')}
                                            method="post"
                                            as="button"
                                            className="text-xs text-amber-700 underline hover:text-amber-900 whitespace-nowrap font-medium"
                                        >
                                            Atcelt maiņu
                                        </Link>
                                    </div>
                                )}

                                <Form
                                    method="patch"
                                    action={route('profile.settings.update')}
                                    className="space-y-5"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            {/* Name row */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Vārds
                                                    </label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        name="name"
                                                        defaultValue={user.name}
                                                        required
                                                        autoComplete="given-name"
                                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow ${
                                                            errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    <InputError message={errors.name} className="mt-1.5" />
                                                </div>

                                                <div>
                                                    <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Uzvārds
                                                    </label>
                                                    <input
                                                        id="lastname"
                                                        type="text"
                                                        name="lastname"
                                                        defaultValue={user.lastname || ''}
                                                        autoComplete="family-name"
                                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow ${
                                                            errors.lastname ? 'border-red-400 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    <InputError message={errors.lastname} className="mt-1.5" />
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    E-pasta adrese
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        name="email"
                                                        defaultValue={user.email}
                                                        required
                                                        autoComplete="email"
                                                        disabled={isOAuthUser}
                                                        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow ${
                                                            isOAuthUser
                                                                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                : errors.email
                                                                    ? 'border-red-400 bg-red-50'
                                                                    : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {isOAuthUser && (
                                                        <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                                    )}
                                                </div>

                                                <InputError message={errors.email} className="mt-1.5" />

                                                {isOAuthUser && (
                                                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                                                        <Info className="w-3.5 h-3.5" />
                                                        E-pasts nevar tikt mainīts, jo esi pieslēdzies ar Google
                                                    </p>
                                                )}

                                                {/* Unverified warning */}
                                                {mustVerifyEmail && !user.email_verified_at && !isOAuthUser && !user.pending_email && (
                                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm text-yellow-800">
                                                                    Tavs e-pasts nav apstiprināts.
                                                                </p>
                                                                <Link
                                                                    href={route('settings.verification.send')}
                                                                    method="post"
                                                                    as="button"
                                                                    className="text-sm text-yellow-700 underline hover:text-yellow-900 mt-1"
                                                                >
                                                                    Nosūtīt apstiprinājuma e-pastu
                                                                </Link>
                                                                {status === 'verification-link-sent' && (
                                                                    <p className="mt-1.5 text-sm text-green-600">
                                                                        Apstiprinājuma saite nosūtīta!
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Email change info hint */}
                                                {!isOAuthUser && !user.pending_email && (
                                                    <p className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
                                                        <Info className="w-3.5 h-3.5" />
                                                        Mainot e-pastu, uz jauno adresi tiks nosūtīts apstiprinājums
                                                    </p>
                                                )}
                                            </div>

                                            {/* Save */}
                                            <div className="flex items-center gap-3 pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {processing ? 'Saglabā...' : 'Saglabāt'}
                                                </button>
                                                {recentlySuccessful && (
                                                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Saglabāts!
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        )}

                        {/* ── SECURITY TAB ── */}
                        {activeTab === 'security' && (
                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Drošības iestatījumi</h3>
                                    <p className="text-sm text-gray-500 mt-1">Maini savu paroli</p>
                                </div>

                                {isOAuthUser && (
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-blue-800">
                                            Paroles maiņa nav pieejama Google kontiem. Tava drošība tiek pārvaldīta caur Google.
                                        </p>
                                    </div>
                                )}

                                <Form
                                    method="put"
                                    action={route('password.settings.update')}
                                    className="space-y-5"
                                >
                                    {({ processing, recentlySuccessful, errors }) => (
                                        <>
                                            {[
                                                { id: 'current_password', label: 'Pašreizējā parole', autoComplete: 'current-password', placeholder: isOAuthUser ? 'Nav pieejams Google kontiem' : '' },
                                                { id: 'password', label: 'Jaunā parole', autoComplete: 'new-password', placeholder: isOAuthUser ? 'Nav pieejams Google kontiem' : '' },
                                                { id: 'password_confirmation', label: 'Apstiprini jauno paroli', autoComplete: 'new-password', placeholder: isOAuthUser ? 'Nav pieejams Google kontiem' : '' },
                                            ].map(({ id, label, autoComplete, placeholder }) => (
                                                <div key={id}>
                                                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        {label}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id={id}
                                                            type="password"
                                                            name={id}
                                                            autoComplete={autoComplete}
                                                            disabled={isOAuthUser}
                                                            placeholder={placeholder}
                                                            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow ${
                                                                isOAuthUser
                                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                                    : (errors as any)[id]
                                                                        ? 'border-red-400 bg-red-50'
                                                                        : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {isOAuthUser && (
                                                            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                                        )}
                                                    </div>
                                                    <InputError message={(errors as any)[id]} className="mt-1.5" />
                                                </div>
                                            ))}

                                            <div className="flex items-center gap-3 pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={processing || isOAuthUser}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    {processing ? 'Atjauno...' : 'Atjaunot paroli'}
                                                </button>
                                                {recentlySuccessful && (
                                                    <span className="flex items-center gap-1.5 text-sm text-green-600">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Parole atjaunota!
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>
                        )}

                        {/* ── DANGER TAB ── */}
                        {activeTab === 'danger' && (
                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <h3 className="text-lg font-semibold text-red-600">Bīstamā zona</h3>
                                    <p className="text-sm text-gray-500 mt-1">Šīs darbības ir neatgriezeniskas</p>
                                </div>

                                <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-semibold text-red-900 mb-2">Dzēst kontu</h4>
                                            <p className="text-sm text-red-700 mb-4 leading-relaxed">
                                                Pēc konta dzēšanas visi tavi dati tiks neatgriezeniski izdzēsti —
                                                profils, fotogrāfijas, draugi un visi ieraksti. Šo darbību nevar atcelt.
                                            </p>
                                            <button
                                                onClick={() => setShowDeleteModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Dzēst kontu
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── DELETE MODAL ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Dzēst kontu</h3>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Vai esi <strong>pilnīgi pārliecināts</strong>? Šī darbība ir neatgriezeniska.
                            Visi tavi dati, fotogrāfijas un saziņa tiks neatgriezeniski dzēsti.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                Atcelt
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                {isDeleting ? 'Dzēš...' : 'Dzēst kontu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
