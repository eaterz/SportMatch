import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, MapPin, Users, Plus, Lock, Globe, Filter, Calendar } from 'lucide-react';
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
}

interface Group {
    id: number;
    name: string;
    description?: string;
    location?: string;
    cover_photo?: string;
    cover_photo_url?: string;
    is_private: boolean;
    max_members?: number;
    approved_members_count: number;
    creator: User;
    sports: Sport[];
    is_member?: boolean;
    is_admin?: boolean;
    has_pending_request?: boolean;
}

interface Props {
    user: User;
    myGroups: Group[];
    publicGroups: {
        data: Group[];
        links: any;
        meta: any;
    };
    sports: Sport[];
    filters?: {
        search?: string;
        sport_id?: string;
        location?: string;
    };
}

export default function GroupsIndex({ user, myGroups = [], publicGroups, sports = [], filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSport, setSelectedSport] = useState(filters.sport_id || '');
    const [location, setLocation] = useState(filters.location || '');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        router.get('/groups', {
            search: searchTerm,
            sport_id: selectedSport,
            location: location,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSport('');
        setLocation('');
        router.get('/groups', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const joinGroup = (groupId: number) => {
        router.post(`/groups/${groupId}/join`, {}, {
            preserveScroll: true,
        });
    };

    const renderMyGroupCard = (group: Group) => {
        // Pārbauda vai lietotājs ir grupas izveidotājs vai admins
        const isCreator = group.creator?.id === user.id;
        const isAdmin = group.is_admin || isCreator;

        return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                {/* Cover foto */}
                <div className="relative h-32 bg-gray-100">
                    {group.cover_photo_url ? (
                        <img
                            src={group.cover_photo_url}
                            alt={group.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Users className="w-12 h-12 text-gray-400" />
                        </div>
                    )}
                    {group.is_private && (
                        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">Privāta</span>
                        </div>
                    )}
                </div>

                <div className="p-4">
                    {/* Grupas nosaukums */}
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{group.name}</h3>

                    {/* Atrašanās vieta */}
                    {group.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{group.location}</span>
                        </div>
                    )}

                    {/* Apraksts */}
                    {group.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {group.description}
                        </p>
                    )}

                    {/* Sporta veidi */}
                    {group.sports.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {group.sports.slice(0, 3).map(sport => (
                                <span key={sport.id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                    <span>{sport.icon}</span>
                                    <span>{sport.name}</span>
                                </span>
                            ))}
                            {group.sports.length > 3 && (
                                <span className="text-xs text-gray-500 px-2 py-1">
                                    +{group.sports.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Dalībnieku skaits */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{group.approved_members_count} dalībnieki</span>
                            {group.max_members && (
                                <span className="text-gray-400">/ {group.max_members}</span>
                            )}
                        </div>
                    </div>

                    {/* Darbības pogas - tikai Apskatīt un Pārvaldīt (ja admin) */}
                    <div className="flex gap-2">
                        <Link
                            href={`/groups/${group.id}`}
                            className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Apskatīt
                        </Link>

                        {isAdmin && (
                            <Link
                                href={`/groups/${group.id}/settings`}
                                className="flex-1 text-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Pārvaldīt
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderPublicGroupCard = (group: Group) => (
        <div key={group.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
            {/* Cover foto */}
            <div className="relative h-32 bg-gray-100">
                {group.cover_photo_url ? (
                    <img
                        src={group.cover_photo_url}
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-400" />
                    </div>
                )}
                {group.is_private && (
                    <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs">Privāta</span>
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* Grupas nosaukums */}
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{group.name}</h3>

                {/* Atrašanās vieta */}
                {group.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{group.location}</span>
                    </div>
                )}

                {/* Apraksts */}
                {group.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {group.description}
                    </p>
                )}

                {/* Sporta veidi */}
                {group.sports.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {group.sports.slice(0, 3).map(sport => (
                            <span key={sport.id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                                <span>{sport.icon}</span>
                                <span>{sport.name}</span>
                            </span>
                        ))}
                        {group.sports.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                                +{group.sports.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Dalībnieku skaits */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.approved_members_count} dalībnieki</span>
                        {group.max_members && (
                            <span className="text-gray-400">/ {group.max_members}</span>
                        )}
                    </div>
                </div>

                {/* Darbības pogas - tikai Apskatīt un Pievienoties */}
                <div className="flex gap-2">
                    <Link
                        href={`/groups/${group.id}`}
                        className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Apskatīt
                    </Link>

                    {group.has_pending_request ? (
                        <button
                            disabled
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                            Gaida apstiprinājumu
                        </button>
                    ) : (
                        <button
                            onClick={() => joinGroup(group.id)}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Pievienoties
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    // Filtrē publiskās grupas - slēpj grupas kurās lietotājs jau ir dalībnieks
    const filteredPublicGroups = publicGroups.data.filter(group => !group.is_member);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Grupas - SportMatch" />
            <Navbar user={user}/>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sporta grupas</h1>
                        <p className="text-gray-600">Pievienojies grupām un atrodi domubiedrus</p>
                    </div>
                    <Link
                        href="/groups/create"
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Izveidot grupu</span>
                    </Link>
                </div>

                {/* Manas grupas */}
                {myGroups.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manas grupas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {myGroups.map(group => renderMyGroupCard(group))}
                        </div>
                    </div>
                )}

                {/* Meklēšana un filtri */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Meklēšanas lauks */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Meklēt grupas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Meklēt
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-colors ${
                                showFilters ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtri</span>
                        </button>
                    </div>

                    {/* Filtri */}
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
                                        Atrašanās vieta
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Rīga, Latvija..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Notīrīt filtrus
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Publiskās grupas */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Atklāj jaunas grupas</h2>
                    {filteredPublicGroups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPublicGroups.map(group => renderPublicGroupCard(group))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-900 mb-2">Nav atrasta neviena grupa</h3>
                            <p className="text-gray-600 mb-6">Izmēģini citus meklēšanas kritērijus</p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Notīrīt filtrus
                            </button>
                        </div>
                    )}
                </div>

                {/* Paginācija */}
                {publicGroups.meta && publicGroups.meta.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {publicGroups.links.map((link: any, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 rounded ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    preserveScroll
                                    preserveState
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
