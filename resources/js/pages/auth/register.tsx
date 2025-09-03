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
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Uzvārds
                                        </label>
                                        <input
                                            id="lastname"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="lastname"
                                            name="lastname"
                                            placeholder="Tavs Uzvārds"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                        />
                                        <InputError message={errors.name} />
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
                                            tabIndex={2}
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
                                                tabIndex={3}
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
                                                tabIndex={4}
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
                                        tabIndex={5}
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
                                        <TextLink href={route('login')} tabIndex={6} className="text-black font-medium hover:underline">
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
