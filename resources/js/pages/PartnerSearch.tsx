import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, MapPin, Star, UserPlus, MessageCircle, Check, Clock, Filter } from 'lucide-react';
import Navbar from '@/components/navbar';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
}

interface Sport {
    id: number;
    name: string;
    icon: string;
    pivot?: {
        skill_level: string;
        is_preferred: boolean;
    };
}

interface Partner {
    id: number;
    name: string;
    lastname?: string;
    profile?: {
        age: number;
        location: string;
        bio?: string;
    };
    sports?: Sport[];
    friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    distance?: number;
}

interface Props {
    user: User;
    partners: Partner[];
    filters?: {
        location?: string;
        sport?: string;
        skill_level?: string;
        max_distance?: number;
    };
}

export default function PartnerSearch({ user, partners = [], filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const sendFriendRequest = (partnerId: number) => {
        router.post(`/friends/${partnerId}/request`);
    };

    const acceptFriendRequest = (partnerId: number) => {
        router.post(`/friends/${partnerId}/accept`);
    };


    const getFriendshipButton = (partner: Partner) => {
        switch (partner.friendship_status) {
            case 'friends':
                return (
                    <Link
                        href={`/chat/${partner.id}`}
                        className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Čatot</span>
                    </Link>
                );
            case 'pending_sent':
                return (
                    <div className="flex items-center space-x-2 bg-gray-200 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed">
                        <Clock className="w-4 h-4" />
                        <span>Nosūtīts</span>
                    </div>
                );
            case 'pending_received':
                return (
                    <button
                        onClick={() => acceptFriendRequest(partner.id)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Check className="w-4 h-4" />
                        <span>Pieņemt</span>
                    </button>
                );
            default:
                return (
                    <button
                        onClick={() => sendFriendRequest(partner.id)}
                        className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>Pievienot</span>
                    </button>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Meklēt partnerus - SportMatch" />
            <Navbar user={user} />
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Meklēt sporta partnerus</h1>
                    <p className="text-gray-600">Atrodi cilvēkus ar līdzīgām sporta interesēm</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Meklēt pēc vārda vai atrašanās vietas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtri</span>
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sports
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400">
                                        <option value="">Visi sporti</option>
                                        <option value="futbols">Futbols</option>
                                        <option value="basketbols">Basketbols</option>
                                        <option value="teniss">Teniss</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prasmes līmenis
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400">
                                        <option value="">Visi līmeņi</option>
                                        <option value="beginner">Iesācējs</option>
                                        <option value="intermediate">Vidējais</option>
                                        <option value="advanced">Pieredzējis</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Attālums (km)
                                    </label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400">
                                        <option value="">Jebkurš</option>
                                        <option value="5">5 km</option>
                                        <option value="10">10 km</option>
                                        <option value="25">25 km</option>
                                        <option value="50">50 km</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {partners.length > 0 ? (
                        partners.map(partner => (
                            <div key={partner.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                {/* Profile Header */}
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-gray-600">
                                            {partner.name.charAt(0)}{partner.lastname?.charAt(0) || ''}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {partner.name} {partner.lastname || ''}
                                        </h3>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            <span>{partner.profile?.age || 'Nav norādīts'} gadi</span>
                                            {partner.profile?.location && (
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{partner.profile.location}</span>
                                                </div>
                                            )}
                                        </div>
                                        {partner.distance && (
                                            <div className="text-xs text-gray-500">
                                                ~{partner.distance} km attālumā
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {partner.profile?.bio && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                        {partner.profile.bio}
                                    </p>
                                )}

                                {/* Sports */}
                                {partner.sports && partner.sports.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {partner.sports.slice(0, 3).map((sport) => (
                                                <div key={sport.id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    <span className="text-sm">{sport.icon}</span>
                                                    <span className="text-xs text-gray-700">{sport.name}</span>
                                                </div>
                                            ))}
                                            {partner.sports.length > 3 && (
                                                <span className="text-xs text-gray-500 px-2 py-1">
                                                    +{partner.sports.length - 3} vairāk
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="flex justify-center">
                                    {getFriendshipButton(partner)}
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State */
                        <div className="col-span-full text-center py-12">
                            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nav atrasti partneri</h3>
                            <p className="text-gray-600 mb-4">
                                Izmēģini mainīt meklēšanas kritērijus vai filtrus
                            </p>
                            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                                Notīrīt filtrus
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
