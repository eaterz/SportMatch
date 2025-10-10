import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const resendVerification = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Head title="Verify Email" />
            <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    Lūdzu, apstiprini savu e-pasta adresi
                </h1>

                {status === 'verification-link-sent' && (
                    <div className="text-green-600 text-center mb-4">
                        Jauna apstiprinājuma saite tika nosūtīta uz tavu e-pastu!
                    </div>
                )}

                <p className="text-gray-600 text-center mb-6">
                    Pirms turpināšanas, pārbaudi savu e-pastu verifikācijas saitei.
                    Ja nesaņēmi e-pastu, vari to nosūtīt vēlreiz.
                </p>

                <form onSubmit={resendVerification} className="text-center">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Nosūtīt vēlreiz
                    </button>
                </form>
            </div>
        </div>
    );
}
