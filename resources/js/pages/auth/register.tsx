import React, { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import { Trophy, Eye, EyeOff, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

interface RegisterProps {
    status?: string;
}

export default function Register({ status }: RegisterProps) {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState<boolean>(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Register" />
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600">Izveido savu kontu</p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                        <p className="text-sm text-green-700">{status}</p>
                    </div>
                )}

                {/* Register Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Google Register Button */}
                    <a
                        href={route('google.redirect')}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-gray-700 font-medium">Reģistrēties ar Google</span>
                    </a>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Vai</span>
                        </div>
                    </div>

                    <Form
                        method="post"
                        action={route('register')}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-6">
                                    {/* Name */}
                                    <div className="grid gap-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Vārds
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Tavs vārds"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* LastName */}
                                    <div className="grid gap-2">
                                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                                            Uzvārds
                                        </label>
                                        <input
                                            id="lastname"
                                            type="text"
                                            required
                                            tabIndex={2}
                                            autoComplete="family-name"
                                            name="lastname"
                                            placeholder="Tavs Uzvārds"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                        />
                                        <InputError message={errors.lastname} />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            E-pasts
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={3}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="tavs@epasts.lv"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Parole
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                name="password"
                                                placeholder="Izvēlies paroli"
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                            Apstiprini paroli
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password_confirmation"
                                                type={showPasswordConfirmation ? "text" : "password"}
                                                required
                                                tabIndex={5}
                                                autoComplete="new-password"
                                                name="password_confirmation"
                                                placeholder="Apstiprini paroli"
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Register Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        tabIndex={6}
                                        className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                                <span>Izveido kontu...</span>
                                            </>
                                        ) : (
                                            <span>Izveidot kontu</span>
                                        )}
                                    </button>
                                </div>

                                {/* Login Link */}
                                <div className="text-center">
                                    <p className="text-gray-600">
                                        Jau ir konts?{' '}
                                        <TextLink href={route('login')} tabIndex={7} className="text-black font-medium hover:underline">
                                            Pieslēgties
                                        </TextLink>
                                    </p>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © 2025 SportMatch
                    </p>
                </div>
            </div>
        </div>
    );
}
