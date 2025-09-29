import React from 'react';

interface StatCardProps {
    icon: React.ReactElement<{ className?: string }>;
    title: string;
    value: string | number;
    color?: 'yellow' | 'blue' | 'green' | 'purple' | 'red';
    trend?: string | null;
}

export function StatCard({ icon, title, value, color = 'blue', trend = null }: StatCardProps) {
    const colorClasses = {
        yellow: 'from-yellow-400 to-orange-500',
        blue: 'from-blue-500 to-indigo-600',
        green: 'from-green-400 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        red: 'from-red-400 to-rose-500'
    };

    const bgColorClasses = {
        yellow: 'bg-gradient-to-br from-yellow-50 to-orange-50',
        blue: 'bg-gradient-to-br from-blue-50 to-indigo-50',
        green: 'bg-gradient-to-br from-green-50 to-emerald-50',
        purple: 'bg-gradient-to-br from-purple-50 to-pink-50',
        red: 'bg-gradient-to-br from-red-50 to-rose-50'
    };

    return (
        <div className={`${bgColorClasses[color]} rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100`}>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-lg`}>
                        {React.cloneElement(icon, { className: "w-7 h-7 text-white" })}
                    </div>
                    {trend && (
                        <span className="text-xs font-semibold text-gray-600 bg-white/70 px-2 py-1 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
                <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{title}</h3>
                    <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>
                </div>
            </div>
        </div>
    );
}
