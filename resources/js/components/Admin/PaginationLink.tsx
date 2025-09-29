import React from 'react';
import { Link } from '@inertiajs/react';

interface PaginationLinkProps {
    link: {
        url: string | null;
        label: string;
        active: boolean;
    };
}

export function PaginationLink({ link }: PaginationLinkProps) {
    const label = link.label
        .replace('&laquo;', '«')
        .replace('&raquo;', '»')
        .replace('Previous', 'Iepriekšējā')
        .replace('Next', 'Nākamā');

    if (!link.url) {
        return (
            <span className="px-3 py-1 text-gray-400 cursor-not-allowed">
                {label}
            </span>
        );
    }

    return (
        <Link
            href={link.url}
            className={`px-3 py-1 rounded-lg transition-colors ${
                link.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            dangerouslySetInnerHTML={{ __html: label }}
        />
    );
}
