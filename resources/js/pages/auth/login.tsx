import React, { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import { Trophy, Eye, EyeOff, LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const [showPassword, setShowPassword] = useState<boolean>(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Login" />
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">SportMatch</h1>
                    </div>
                    <p className="text-gray-600">Pieslēdzies savam kontam</p>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                        <p className="text-sm text-green-700">{status}</p>
                    </div>
                )}

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <Form
                        method="post"
                        action={route('login')}
                        disableWhileProcessing
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-6">
                                    {/* Email */}
                                    <div className="grid gap-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            E-pasts
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="username"
                                            placeholder="tavs@epasts.lv"
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <div className="flex justify-between items-center">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Parole
                                            </label>
                                            {canResetPassword && (
                                                <TextLink href={route('password.request')} className="text-sm text-blue-600 hover:text-blue-700">
                                                    Aizmirsi paroli?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Ievadi paroli"
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

                                    {/* Remember Me */}
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            name="remember"
                                            tabIndex={3}
                                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                        />
                                        <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                            Atcerēties mani
                                        </label>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        tabIndex={4}
                                        className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="w-4 h-4 animate-spin" />
                                                <span>Pieslēdzas...</span>
                                            </>
                                        ) : (
                                            <span>Pieslēgties</span>
                                        )}
                                    </button>
                                </div>

                                {/* Register Link */}
                                <div className="text-center">
                                    <p className="text-gray-600">
                                        Nav konta?{' '}
                                        <TextLink href={route('register')} tabIndex={5} className="text-black font-medium hover:underline">
                                            Reģistrējies
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
