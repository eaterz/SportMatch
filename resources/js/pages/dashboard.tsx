import React from 'react';
import { Head } from '@inertiajs/react';
import { Trophy, Users, Search, Plus } from 'lucide-react';

import Navbar from '@/components/navbar';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    has_subscription?: boolean;
}

interface Props {
    user?: User;
}

export default function Dashboard({ user }: Props) {
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600">Ielādē dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Dashboard - SportMatch" />

            {/* Use Navbar Component */}
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sveiks, {user.name}!
                    </h1>
                    <p className="text-gray-600">
                        Gatavs jaunām sporta aktivitātēm?
                    </p>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Create Group Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Izveidot pūlciņu
                            </h3>

                                <>
                                    <p className="text-gray-600 mb-4">
                                        Organizē jaunu sporta aktivitāti un aicini citus pievienoties
                                    </p>
                                    <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium">
                                        Izveidot jaunu pūlciņu
                                    </button>
                                </>
                        </div>
                    </div>

                    {/* Find Groups Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Meklēt pūlciņus
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Atrodi sporta aktivitātes savā tuvumā un pievienojies
                            </p>
                            <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-medium">
                                Meklēt aktivitātes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tava statistika</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">0</div>
                            <div className="text-sm text-gray-600">Pūlciņi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-sm text-gray-600">Partneri</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">0</div>
                            <div className="text-sm text-gray-600">Aktivitātes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-gray-600">Konts</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Jaunākās aktivitātes</h2>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4">Vēl nav aktivitāšu</p>
                        <p className="text-sm text-gray-400">
                            Kad pievienosies kādam pūlciņam, šeit redzēsi aktivitātes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
