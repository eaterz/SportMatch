import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { StatusBadge } from '@/components/Admin/StatusBadge';
import { User, Camera, CheckCircle, XCircle, Clock, ArrowLeft, Eye, Calendar, FileText } from 'lucide-react';

interface City {
    id: number;
    name: string;
    region: string;
}

interface ShowProps {
    verificationRequest: any;
    photos: {
        selfie: string;
        id_document: string;
        selfie_with_id: string;
    };
    previousAttempts: any[];
    user: any;
    cities: City[];
}

export default function Show({ verificationRequest, photos, previousAttempts, user }: ShowProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleApprove = async () => {
        if (!confirm('Vai esat pārliecināts, ka vēlaties apstiprināt šo verifikāciju?')) return;
        setProcessing(true);
        try {
            await axios.post(`/admin/verification/${verificationRequest.id}/approve`);
            router.visit(route('admin.verification.index'));
        } catch (error) {
            console.error('Approve error:', error);
            alert('Kļūda apstiprinot verifikāciju');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return;
        setProcessing(true);
        try {
            await axios.post(`/admin/verification/${verificationRequest.id}/reject`, {
                reason: rejectReason
            });
            setShowRejectModal(false);
            setRejectReason('');
            router.visit(route('admin.verification.index'));
        } catch (error) {
            console.error('Reject error:', error);
            alert('Kļūda noraidot verifikāciju');
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('lv-LV', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <Head title="Verifikācijas pārskats - Admin" />

            <AdminHeader title="Verifikācijas pārskats" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => window.history.back()}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Atpakaļ uz sarakstu
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Verifikācijas pieprasījums #{verificationRequest.id}
                                    </h2>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Calendar size={16} className="mr-1" />
                                            Iesniegts: {formatDate(verificationRequest.created_at)}
                                        </span>
                                        {verificationRequest.expires_at && (
                                            <span className="flex items-center text-amber-600">
                                                <Clock size={16} className="mr-1" />
                                                Beigsies: {formatDate(verificationRequest.expires_at)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <StatusBadge status={verificationRequest.status} />
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-blue-900 mb-2">Verifikācijas kods</h4>
                                <p className="text-2xl font-bold text-blue-700 tracking-wider">
                                    {verificationRequest.verification_code}
                                </p>
                                <p className="text-sm text-blue-600 mt-1">
                                    Pārbaudiet, vai šis kods ir redzams selfijā
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Verifikācijas foto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-gray-700">Selfijs ar kodu</h5>
                                        {photos.selfie ? (
                                            <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photos.selfie)}>
                                                <img src={photos.selfie} alt="Selfie" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                                    <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <Camera className="text-gray-400" size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-gray-700">Personas dokuments</h5>
                                        {photos.id_document ? (
                                            <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photos.id_document)}>
                                                <img src={photos.id_document} alt="ID" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                                    <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                                <FileText className="text-gray-400" size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-gray-700">Selfijs ar dokumentu</h5>
                                        {photos.selfie_with_id ? (
                                            <div className="relative group cursor-pointer" onClick={() => setSelectedPhoto(photos.selfie_with_id)}>
                                                <img src={photos.selfie_with_id} alt="Selfie with ID" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                                    <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-sm">
                                                Nav pievienots
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {previousAttempts.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Iepriekšējie mēģinājumi ({previousAttempts.length})
                                </h3>
                                <div className="space-y-3">
                                    {previousAttempts.map((attempt) => (
                                        <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-600">#{attempt.id}</span>
                                                <StatusBadge status={attempt.status} />
                                                <span className="text-sm text-gray-600">{formatDate(attempt.created_at)}</span>
                                            </div>
                                            {attempt.rejection_reason && (
                                                <div className="text-sm text-red-600 max-w-xs truncate">
                                                    {attempt.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lietotāja informācija</h3>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <User className="text-gray-400" size={20} />
                                    <div>
                                        <p className="font-medium text-gray-900">{user.name} {user.lastname}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                                {user.profile && (
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Vecums:</span>
                                                <p className="font-medium">{user.profile.age || 'Nav norādīts'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Pilsēta:</span>
                                                <p className="font-medium">{user.profile?.city?.name || 'Nav norādīta'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Reģistrēts:</span>
                                                <p className="font-medium">{formatDate(user.created_at)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Verificēts:</span>
                                                <p className={`font-medium ${user.profile?.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                                                    {user.profile?.is_verified ? 'Jā' : 'Nē'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {verificationRequest.status === 'pending' && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Darbības</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleApprove}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} className="mr-2" />
                                        {processing ? 'Apstrādā...' : 'Apstiprināt'}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={processing}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={20} className="mr-2" />
                                        Noraidīt
                                    </button>
                                </div>
                            </div>
                        )}

                        {verificationRequest.reviewed_at && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pārbaudes informācija</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">Pārbaudīja:</span>
                                        <p className="font-medium">
                                            {verificationRequest.reviewer
                                                ? `${verificationRequest.reviewer.name} ${verificationRequest.reviewer.lastname}`
                                                : 'Sistēma'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Pārbaudes laiks:</span>
                                        <p className="font-medium">{formatDate(verificationRequest.reviewed_at)}</p>
                                    </div>
                                    {verificationRequest.rejection_reason && (
                                        <div>
                                            <span className="text-gray-600">Noraidīšanas iemesls:</span>
                                            <p className="font-medium text-red-600 mt-1">{verificationRequest.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {verificationRequest.metadata && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Papildu informācija</h3>
                                <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(verificationRequest.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Photo modal — inline, not a sub-component */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-4xl max-h-full">
                        <button
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                        >
                            <XCircle size={32} />
                        </button>
                        <img
                            src={selectedPhoto}
                            alt="Verification photo"
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}

            {/* Reject modal — inline, not a sub-component */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Noraidīt verifikāciju</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Noraidīšanas iemesls
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="Aprakstiet, kāpēc verifikācija tiek noraidīta..."
                                autoFocus
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Atcelt
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Apstrādā...' : 'Noraidīt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
