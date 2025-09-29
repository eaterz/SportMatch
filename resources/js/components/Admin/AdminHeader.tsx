import React, { useState } from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AdminHeaderProps {
    title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="bg-white/95 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex justify-between items-center py-5">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                            <p className="text-sm text-gray-500 font-medium">Verifikāciju administrēšana</p>
                        </div>
                    </div>
                    <nav className="flex items-center space-x-3">
                        <Link
                            href="/admin/verification/dashboard"
                            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <span>Panelis</span>
                        </Link>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Izrakstīties</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}
