import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, Clock, AlertTriangle, CheckCircle, Camera, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/navbar';

interface RejectedRequest {
    id: number;
    status: string;
    created_at: string;
    rejection_reason?: string;
}

interface Props {
    user: any;
    rejectedRequests: RejectedRequest[];
}

export default function VerificationStart({ user, rejectedRequests = [] }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Head title="Sākt verifikāciju - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Profila verifikācija
                    </h1>
                    <p className="text-sm sm:text-lg text-gray-600 px-2">
                        Iegūsti zilo atzīmi un palielini uzticamību SportMatch kopienā
                    </p>
                </div>

                {/* Previous Rejections */}
                {rejectedRequests.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <h3 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Iepriekšējie mēģinājumi</h3>
                                <p className="text-red-700 mb-2 text-sm">
                                    Pēdējais iemesls: {rejectedRequests[0].rejection_reason || 'Dokumenti neatbilst prasībām'}
                                </p>
                                <p className="text-red-600 text-xs sm:text-sm">
                                    Lūdzu, pārliecinies, ka dokumenti ir skaidri redzami un atbilst visām prasībām.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                    {/* Requirements */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Ko tev būs nepieciešams</h2>

                        <div className="space-y-3 sm:space-y-4">
                            {/* Selfie with Code */}
                            <div className="flex gap-3 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-300 transition-all">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base">Selfie ar kodu</h3>
                                    <p className="text-blue-700 text-xs sm:text-sm">
                                        Uzņem selfie, turot verifikācijas kodu (mēs to sniedzīsim)
                                    </p>
                                </div>
                            </div>

                            {/* ID Document */}
                            <div className="flex gap-3 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-300 transition-all">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">ID dokuments</h3>
                                    <p className="text-green-700 text-xs sm:text-sm">
                                        Pase, ID karte vai vadītāja apliecība (derīgs dokuments)
                                    </p>
                                </div>
                            </div>

                            {/* Optional Selfie with ID */}
                            <div className="flex gap-3 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-300 transition-all">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-purple-900 text-sm sm:text-base">
                                        Selfie ar ID
                                        <span className="text-purple-600 text-xs font-normal ml-1">(neobligāti)</span>
                                    </h3>
                                    <p className="text-purple-700 text-xs sm:text-sm">
                                        Paātrina verifikācijas procesu
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Verifikācijas ieguvumi</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm sm:text-base">Zilā verificētā atzīme pie vārda</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm sm:text-base">Augstāka uzticamība no citiem lietotājiem</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm sm:text-base">Prioritāte meklēšanas rezultātos</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm sm:text-base">Piekļuve VIP funkcijām</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700 text-sm sm:text-base">Drošāka sporta partneru meklēšana</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                <Clock className="w-4 h-4" />
                                Laika grafiks
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm">
                                Verifikācija parasti aizņem 1-3 darba dienas. Tu saņemsi e-pasta paziņojumu par rezultātu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="text-center mb-6 sm:mb-8">
                    <button
                        onClick={() => router.get('/verification/start')}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-lg"
                    >
                        Sākt verifikāciju tagad
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                        Process aizņems aptuveni 5 minūtes
                    </p>
                </div>

                {/* Privacy Notice */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        Privātuma aizsardzība
                    </h3>
                    <div className="text-gray-700 text-xs sm:text-sm space-y-2">
                        <div className="flex gap-2">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <p>Visi dokumenti tiek šifrēti un droši glabāti</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <p>Dati tiek izmantoti tikai profila verifikācijai</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <p>Pēc verifikācijas dokumenti tiek dzēsti 7 dienu laikā</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <p>Mēs nekad nedalāmies ar taviem datiem ar trešām pusēm</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
