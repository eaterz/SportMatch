import React from 'react';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, Clock, Mail, ArrowRight, Home } from 'lucide-react';


export default function VerificationSuccess() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            <Head title="Verifikācija iesniegta - SportMatch" />

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Verifikācija veiksmīgi iesniegta!
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Paldies! Mēs esam saņēmuši tavu verifikācijas pieprasījumu un sākam dokumentu pārbaudi.
                    </p>

                    {/* Timeline */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <h2 className="text-lg font-semibold text-blue-900">Ko gaidīt tālāk?</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                                <p className="font-medium text-gray-900">Dokumentu pārbaude</p>
                                <p className="text-gray-600">1-3 darba dienas</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                                <p className="font-medium text-gray-900">E-pasta paziņojums</p>
                                <p className="text-gray-600">Par rezultātu</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                                <p className="font-medium text-gray-900">Verificētā atzīme</p>
                                <p className="text-gray-600">Profila aktivizācija</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Notification */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                        <div className="flex items-center justify-center gap-2 text-yellow-800">
                            <Mail className="w-5 h-5" />
                            <span className="font-medium">Tu saņemsi e-pasta paziņojumu, kad verifikācija būs pabeigta</span>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-gray-600 mb-8 space-y-2">
                        <p>📱 Verifikācijas statuss būs redzams tavā profilā</p>
                        <p>🔒 Visi dokumenti tiek droši glabāti un dzēsti pēc verifikācijas</p>
                        <p>⚡ Verificēti lietotāji iegūst prioritāti meklēšanas rezultātos</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.get('/profile')}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
                        >
                            <ArrowRight className="w-4 h-4" />
                            Skatīt profilu
                        </button>
                        <button
                            onClick={() => router.get('/dashboard')}
                            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-medium transition-all"
                        >
                            <Home className="w-4 h-4" />
                            Uz sākumlapu
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                        <p>Ja tev rodas jautājumi par verifikācijas procesu, raksti mums uz
                            <a href="mailto:support@sportmatch.lv" className="text-blue-600 hover:text-blue-700 font-medium"> support@sportmatch.lv</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
