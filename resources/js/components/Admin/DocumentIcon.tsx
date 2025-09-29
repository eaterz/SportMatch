import React from 'react';
import { Camera, FileText, UserCheck } from 'lucide-react';

type ColorType = 'blue' | 'green' | 'purple';

interface DocumentIconProps {
    type: 'selfie' | 'id' | 'selfie_id';
    exists?: boolean;
}

export function DocumentIcon({ type, exists = false }: DocumentIconProps) {
    const typeConfig = {
        selfie: { icon: Camera, label: 'Selfijā', color: 'blue' as ColorType },
        id: { icon: FileText, label: 'ID', color: 'green' as ColorType },
        selfie_id: { icon: UserCheck, label: 'Selfijs ar ID', color: 'purple' as ColorType }
    };

    const config = typeConfig[type];
    const IconComponent = config.icon;

    if (!exists) {
        return (
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center" title={`${config.label} - Nav`}>
                <IconComponent className="w-4 h-4 text-gray-400" />
            </div>
        );
    }

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600'
    };

    return (
        <div className={`w-8 h-8 ${colorClasses[config.color]} rounded-lg flex items-center justify-center`} title={`${config.label} - Pieejams`}>
            <IconComponent className="w-4 h-4" />
        </div>
    );
}
