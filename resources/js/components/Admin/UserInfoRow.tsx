import React from 'react';

interface UserInfoRowProps {
    label: string;
    value?: string | number | null;
    highlighted?: boolean;
}

export function UserInfoRow({ label, value, highlighted = false }: UserInfoRowProps) {
    return (
        <div className={`flex justify-between py-2 border-b border-gray-100 ${highlighted ? 'bg-yellow-50' : ''}`}>
            <span className="text-gray-600 text-sm">{label}:</span>
            <span className={`text-sm font-medium ${highlighted ? 'text-yellow-700' : 'text-gray-900'}`}>
                {value || 'Nav norādīts'}
            </span>
        </div>
    );
}
