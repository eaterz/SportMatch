import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const resendVerification = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    const deleteAccount = (e: React.FormEvent) => {
        e.preventDefault();
        setDeleting(true);
        router.delete(route('profile.settings.destroy'), {
            onSuccess: () => router.visit('/'),
            onError: () => setDeleting(false),
            onFinish: () => setDeleting(false),
        });
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

                <form onSubmit={resendVerification} className="text-center mb-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Nosūtīt vēlreiz
                    </button>
                </form>

                <hr className="my-4 border-gray-200" />

                {!showConfirm ? (
                    <div className="text-center">
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="text-red-500 text-sm hover:underline"
                        >
                            Dzēst profilu
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            Vai tiešām vēlies dzēst savu profilu? Šo darbību nevar atsaukt.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Atcelt
                            </button>
                            <button
                                onClick={deleteAccount}
                                disabled={deleting}
                                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Dzēš...' : 'Jā, dzēst profilu'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
