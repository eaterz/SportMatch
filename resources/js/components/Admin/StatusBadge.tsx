import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
    status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const statusConfig = {
        pending: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: Clock,
            label: 'Gaida'
        },
        approved: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: CheckCircle,
            label: 'Apstiprināts'
        },
        rejected: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: XCircle,
            label: 'Noraidīts'
        },
        expired: {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: Clock,
            label: 'Expired'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
            <IconComponent className="w-4 h-4 mr-2" />
            {config.label}
        </span>
    );
}
