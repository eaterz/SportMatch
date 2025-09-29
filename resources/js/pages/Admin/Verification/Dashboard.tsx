import React from 'react';
import { Head } from '@inertiajs/react';
import { AdminHeader } from '@/components/Admin/AdminHeader';
import { StatCard } from '@/components/Admin/StatCard';
import { RequestRow } from '@/components/Admin/RequestRow';
import { Clock, Activity, TrendingUp, Users, CheckCircle } from 'lucide-react';

interface DashboardProps {
    stats: {
        pending_count: number;
        today_pending: number;
        this_week_processed: number;
        approval_rate: number;
        verified_users_total: number;
    };
    recentRequests: any[];
}

export default function Dashboard({ stats, recentRequests }: DashboardProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <Head title="Verifikāciju pārvaldība - Admin" />

            <AdminHeader title="Verifikāciju administrēšana" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={<Clock />}
                        title="Gaida apstiprinājumu"
                        value={stats.pending_count}
                        color="yellow"
                        trend={stats.today_pending > 0 ? `+${stats.today_pending} šodien` : null}
                    />
                    <StatCard
                        icon={<Activity />}
                        title="Apstrādāti šonedēļ"
                        value={stats.this_week_processed}
                        color="blue"
                    />
                    <StatCard
                        icon={<TrendingUp />}
                        title="Apstiprināšanas %"
                        value={`${stats.approval_rate}%`}
                        color="green"
                    />
                    <StatCard
                        icon={<Users />}
                        title="Verificēti lietotāji"
                        value={stats.verified_users_total}
                        color="purple"
                    />
                </div>

                {/* Recent Requests */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="px-8 py-6 bg-gradient-to-r from-gray-900 to-gray-700">
                        <h2 className="text-2xl font-bold text-white">Jaunākie pieprasījumi</h2>
                    </div>

                    {recentRequests && recentRequests.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {recentRequests.map(request => (
                                <RequestRow key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div className="px-8 py-16 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-gray-500">Nav jaunu verifikācijas pieprasījumu!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
