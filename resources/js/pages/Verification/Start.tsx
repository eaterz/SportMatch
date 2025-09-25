import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Shield, Clock, AlertTriangle, CheckCircle, Camera, FileText } from 'lucide-react';
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

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Profila verifikācija
                    </h1>
                    <p className="text-xl text-gray-600">
                        Iegūsti zilo atzīmi un palielini uzticamību SportMatch kopienā
                    </p>
                </div>

                {/* Previous Rejections */}
                {rejectedRequests.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                            <div>
                                <h3 className="font-semibold text-red-900 mb-2">Iepriekšējie mēģinājumi</h3>
                                <p className="text-red-700 mb-3">
                                    Pēdējais iemesls: {rejectedRequests[0].rejection_reason || 'Dokumenti neatbilst prasībām'}
                                </p>
                                <p className="text-red-600 text-sm">
                                    Lūdzu, pārliecinies, ka dokumenti ir skaidri redzami un atbilst visām prasībām.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Requirements */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ko tev būs nepieciešams</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                                <Camera className="w-6 h-6 text-blue-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-blue-900">Selfie ar kodu</h3>
                                    <p className="text-blue-700 text-sm">
                                        Uzņem selfie, turot verifikācijas kodu (mēs to sniedzīsim)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                                <FileText className="w-6 h-6 text-green-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-green-900">ID dokuments</h3>
                                    <p className="text-green-700 text-sm">
                                        Pase, ID karte vai vadītāja apliecība (derīgs dokuments)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                                <Camera className="w-6 h-6 text-purple-600 mt-1" />
                                <div>
                                    <h3 className="font-semibold text-purple-900">Selfie ar ID <span className="text-purple-600">(neobligāti)</span></h3>
                                    <p className="text-purple-700 text-sm">
                                        Paātrina verifikācijas procesu
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Verifikācijas ieguvumi</h2>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Zilā verificētā atzīme pie vārda</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Augstāka uzticamība no citiem lietotājiem</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Prioritāte meklēšanas rezultātos</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Piekļuve VIP funkcijām</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span className="text-gray-700">Drošāka sporta partneru meklēšana</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Laika grafiks
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Verifikācija parasti aizņem 1-3 darba dienas. Tu saņemsi e-pasta paziņojumu par rezultātu.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.get('/verification/start')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        Sākt verifikāciju tagad
                    </button>
                    <p className="text-gray-500 text-sm mt-4">
                        Process aizņems aptuveni 5 minūtes
                    </p>
                </div>

                {/* Privacy Notice */}
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Privātuma aizsardzība
                    </h3>
                    <div className="text-gray-700 text-sm space-y-2">
                        <p>• Visi dokumenti tiek šifrēti un droši glabāti</p>
                        <p>• Dati tiek izmantoti tikai profila verifikācijai</p>
                        <p>• Pēc verifikācijas dokumenti tiek dzēsti 7 dienu laikā</p>
                        <p>• Mēs nekad nedalāmies ar taviem datiem ar trešām pusēm</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
