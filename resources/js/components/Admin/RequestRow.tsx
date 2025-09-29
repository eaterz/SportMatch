import React from 'react';
import { Link } from '@inertiajs/react';
import { User, ChevronRight, Clock } from 'lucide-react';

interface RequestRowProps {
    request: {
        id: number;
        user: {
            name: string;
            lastname?: string;
            email: string;
            profile?: {
                main_photo?: string;
            };
        };
        created_at: string;
        verification_code: string;
    };
}

export function RequestRow({ request }: RequestRowProps) {
    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " gadi";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " mēneši";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " dienas";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " stundas";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minūtes";

        return "Tikko";
    };

    return (
        <Link
            href={`/admin/verification/${request.id}`}
            className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-all duration-200 group"
        >
            <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <div className="relative">
                    {request.user.profile?.main_photo ? (
                        <img
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                            src={request.user.profile.main_photo}
                            alt=""
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-500" />
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                        {request.user.name} {request.user.lastname || ''}
                    </p>
                    <p className="text-sm text-gray-500">{request.user.email}</p>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {/* Verification Code */}
                <div className="hidden sm:block">
                    <p className="text-xs text-gray-500 mb-1">Kods</p>
                    <p className="text-sm font-mono font-bold text-gray-700">
                        {request.verification_code}
                    </p>
                </div>

                {/* Time */}
                <div className="text-right">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{timeSince(request.created_at)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(request.created_at).toLocaleDateString('lv-LV')}
                    </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
        </Link>
    );
}
