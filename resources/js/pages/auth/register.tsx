import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useFormWithErrors } from '@/hooks/useFormWithErrors';
import TextLink from '@/components/text-link';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setField, errors, processing, post } = useFormWithErrors({
        name: '',
        lastname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            resetFields: ['password', 'password_confirmation'],
            onSuccess: () => {
                window.location.href = '/profile/setup/step-1';
            }
        });
    };

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

                {/* Register Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    {/* Google */}
                    <a
                        href={route('google.redirect')}
                        className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        {/* Vārds */}
                        <div className="grid gap-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Vārds
                            </label>
                            <input
                                id="name"
                                type="text"
                                autoFocus
                                value={data.name}
                                onChange={e => setField('name', e.target.value)}
                                placeholder="Tavs vārds"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Uzvārds */}
                        <div className="grid gap-1">
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                                Uzvārds
                            </label>
                            <input
                                id="lastname"
                                type="text"
                                value={data.lastname}
                                onChange={e => setField('lastname', e.target.value)}
                                placeholder="Tavs uzvārds"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.lastname ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.lastname && <p className="text-sm text-red-600">{errors.lastname}</p>}
                        </div>

                        {/* E-pasts */}
                        <div className="grid gap-1">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-pasts
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setField('email', e.target.value)}
                                placeholder="tavs@epasts.lv"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Parole */}
                        <div className="grid gap-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Parole
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setField('password', e.target.value)}
                                    placeholder="Izvēlies paroli"
                                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:border-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Real-time password requirements */}
                            {data.password.length > 0 && (
                                <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 flex flex-col gap-1.5">
                                    {[
                                        { label: 'Vismaz 8 rakstzīmes', ok: data.password.length >= 8 },
                                        { label: 'Vismaz 1 lielais burts (A–Z)', ok: /[A-Z]/.test(data.password) },
                                        { label: 'Vismaz 1 mazais burts (a–z)', ok: /[a-z]/.test(data.password) },
                                        { label: 'Vismaz 1 cipars (0–9)', ok: /[0-9]/.test(data.password) },
                                        { label: 'Vismaz 1 speciālzīme (!@#$…)', ok: /[^A-Za-z0-9]/.test(data.password) },
                                        { label: 'Nav vienkārša (password, 123456…)', ok: !/^(password|parole|123456|qwerty)/i.test(data.password) },
                                    ].map(({ label, ok }) => (
                                        <div key={label} className={`flex items-center gap-2 text-sm ${ok ? 'text-green-700' : 'text-red-600'}`}>
                                            <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-white text-xs flex-shrink-0 ${ok ? 'bg-green-500' : 'bg-red-400'}`}>
                                                {ok ? '✓' : '✗'}
                                            </span>
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Apstiprini paroli */}
                        <div className="grid gap-1">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Apstiprini paroli
                            </label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    onChange={e => setField('password_confirmation', e.target.value)}
                                    placeholder="Apstiprini paroli"
                                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:border-gray-400 ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password_confirmation && <p className="text-sm text-red-600">{errors.password_confirmation}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2 mt-2"
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

                        <div className="text-center">
                            <p className="text-gray-600">
                                Jau ir konts?{' '}
                                <TextLink href={route('login')} className="text-black font-medium hover:underline">
                                    Pieslēgties
                                </TextLink>
                            </p>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">© 2025 SportMatch</p>
                </div>
            </div>
        </div>
    );
}
