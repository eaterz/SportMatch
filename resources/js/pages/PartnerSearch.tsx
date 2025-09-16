import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MapPin, UserPlus, Clock, Filter, Star, User } from 'lucide-react';
import Navbar from '@/components/navbar';

interface UserType {
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
        main_photo?: string;
    };
    sports?: Sport[];
    friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    distance?: number;
}

interface Props {
    user: UserType;
    partners: Partner[];
    sports?: Sport[];
    filters?: {
        search?: string;
        sport?: string;
        skill_level?: string;
        max_distance?: number;
    };
}

export default function PartnerSearch({ user, partners = [], sports = [], filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSport, setSelectedSport] = useState(filters.sport || '');
    const [selectedSkillLevel, setSelectedSkillLevel] = useState(filters.skill_level || '');
    const [selectedDistance, setSelectedDistance] = useState(filters.max_distance || '');

    const handleSearch = () => {
        router.get('/partners', {
            search: searchTerm,
            sport: selectedSport,
            skill_level: selectedSkillLevel,
            max_distance: selectedDistance,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSport('');
        setSelectedSkillLevel('');
        setSelectedDistance('');
        router.get('/partners', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const visiblePartners = partners.filter(
        (partner) => partner.friendship_status === 'none' || partner.friendship_status === 'pending_sent'
    );
    const sendFriendRequest = (partnerId: number) => {
        router.post(`/friends/request/${partnerId}`, {}, {
            preserveScroll: true,
        });
    };


    const getFriendshipButton = (partner: Partner) => {
        switch (partner.friendship_status) {
            case 'pending_sent':
                return (
                    <div className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed">
                        <Clock className="w-4 h-4" />
                        <span>Nosūtīts</span>
                    </div>
                );

            default:
                return (
                    <button
                        onClick={() => sendFriendRequest(partner.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
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
            <Navbar user={user}/>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Meklēt sporta partnerus</h1>
                    <p className="text-gray-600">Atrodi cilvēkus ar līdzīgām sporta interesēm</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Meklēt pēc vārda vai atrašanās vietas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Meklēt
                        </button>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-6 py-3 border rounded-lg transition-colors ${
                                showFilters ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                            }`}
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
                                        Sporta veids
                                    </label>
                                    <select
                                        value={selectedSport}
                                        onChange={(e) => setSelectedSport(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    >
                                        <option value="">Visi sporta veidi</option>
                                        {sports.map(sport => (
                                            <option key={sport.id} value={sport.id}>
                                                {sport.icon} {sport.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prasmes līmenis
                                    </label>
                                    <select
                                        value={selectedSkillLevel}
                                        onChange={(e) => setSelectedSkillLevel(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    >
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
                                    <select
                                        value={selectedDistance}
                                        onChange={(e) => setSelectedDistance(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    >
                                        <option value="">Jebkurš attālums</option>
                                        <option value="5">5 km</option>
                                        <option value="10">10 km</option>
                                        <option value="25">25 km</option>
                                        <option value="50">50 km</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 hover:text-black transition-colors"
                                >
                                    Notīrīt filtrus
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Pielietot filtrus
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visiblePartners.length > 0 ? (
                        visiblePartners.map(partner => (
                            <div key={partner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all">
                                {/* Profile Image Section */}
                                <div className="relative h-48 bg-gray-100">
                                    {partner.profile?.main_photo ? (
                                        <img
                                            src={typeof partner.profile.main_photo === 'string'
                                                ? partner.profile.main_photo
                                                : (partner.profile.main_photo as any)?.url || (partner.profile.main_photo as any)?.photo_url || ''}
                                            alt={`${partner.name} ${partner.lastname || ''}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                console.error('Image failed to load:', partner.profile?.main_photo);
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <User className="w-20 h-20 text-gray-400" />
                                        </div>
                                    )}
                                    {partner.distance && (
                                        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs">
                                            {partner.distance} km
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    {/* Name and Location */}
                                    <div className="mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            {partner.name} {partner.lastname || ''}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                            {partner.profile?.age && (
                                                <span>{partner.profile.age} gadi</span>
                                            )}
                                            {partner.profile?.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{partner.profile.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    {partner.profile?.bio && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {partner.profile.bio}
                                        </p>
                                    )}

                                    {/* Sports */}
                                    {partner.sports && partner.sports.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1">
                                                {partner.sports.slice(0, 3).map((sport) => (
                                                    <div key={sport.id} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                                        <span>{sport.icon}</span>
                                                        <span className="text-gray-700">{sport.name}</span>
                                                        {sport.pivot?.is_preferred ? (
                                                            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                                        ):null}
                                                    </div>
                                                ))}
                                                {partner.sports.length > 3 && (
                                                    <span className="text-xs text-gray-500 px-2 py-1">
                                                        +{partner.sports.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    {getFriendshipButton(partner)}
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State */
                        <div className="col-span-full text-center py-16">
                            <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Nav atrasti partneri</h3>
                            <p className="text-gray-600 mb-6">
                                Izmēģini mainīt meklēšanas kritērijus vai filtrus
                            </p>
                            <button
                                onClick={clearFilters}
                                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Notīrīt filtrus
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
