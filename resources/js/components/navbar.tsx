import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Trophy, Search, Users, User, ChevronDown, LogOut, Settings,UserSearch } from 'lucide-react';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
}

interface Props {
    user: User;
}

export default function Navbar({ user }: Props) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="bg-white shadow-sm mx-30 rounded-b-2xl">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">SportMatch</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/groups"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                            <span>Meklēt pulciņus</span>
                        </Link>

                        <Link
                            href="/partners"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <UserSearch className="w-4 h-4" />
                            <span>Partneri</span>
                        </Link>

                        <Link
                            href="/friends"
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Users className="w-4 h-4" />
                            <span>Draugi</span>
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {user.name.charAt(0)}{user.lastname?.charAt(0) || ''}
                                    </span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="font-medium text-gray-900">
                                            {user.name} {user.lastname || ''}
                                        </div>
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <Link
                                            href="/profile"
                                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Mans profils</span>
                                        </Link>

                                        <Link
                                            href="/settings"
                                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Iestatījumi</span>
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-100 pt-2">
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Izrakstīties</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay to close dropdown */}
            {isProfileOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                />
            )}
        </nav>
    );
}
