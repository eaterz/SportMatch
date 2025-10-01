import React from 'react';
import { CheckCircle } from 'lucide-react';

interface Props {
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    className?: string;
}

export default function VerifiedBadge({
                                          size = 'md',
                                          showTooltip = true,
                                          className = ''
                                      }: Props) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <div className={`relative inline-flex group ${className}`}>
            <CheckCircle className={`${sizeClasses[size]} text-blue-500`} />

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Verificēts profils
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></div>
                </div>
            )}
        </div>
    );
}
