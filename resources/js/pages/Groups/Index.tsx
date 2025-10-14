import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, MapPin, Users, Plus, Lock, Filter} from 'lucide-react';
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

interface City {
    id: number;
    name: string;
    region: string;
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
    cities: City[];
    filters?: {
        search?: string;
        sport_id?: string;
        city_id?: string;
    };
}

export default function GroupsIndex({ user, myGroups = [], publicGroups, sports = [], cities = [], filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedSport, setSelectedSport] = useState(filters.sport_id || '');
    const [selectedCityId, setSelectedCityId] = useState(filters.city_id || '');
    const [searchCity, setSearchCity] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        city.region.toLowerCase().includes(searchCity.toLowerCase())
    );

    const selectedCity = cities.find(c => c.id.toString() === selectedCityId.toString());

    const handleSearch = () => {
        router.get('/groups', {
            search: searchTerm,
            sport_id: selectedSport,
            city_id: selectedCityId,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSport('');
        setSelectedCityId('');
        setSearchCity('');
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
        const isCreator = group.creator?.id === user.id;
        const isAdmin = group.is_admin || isCreator;

        return (
            <div key={group.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                    {group.cover_photo_url ? (
                        <img
                            src={group.cover_photo_url}
                            alt={group.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <Users className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    {group.is_private && (
                        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
                            <Lock className="w-3.5 h-3.5" />
                            <span className="text-xs">Privāta</span>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{group.name}</h3>

                    {group.location && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{group.location}</span>
                        </div>
                    )}

                    {group.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                            {group.description}
                        </p>
                    )}

                    {group.sports.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {group.sports.slice(0, 3).map(sport => (
                                <span key={sport.id} className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                                    <span>{sport.icon}</span>
                                    <span>{sport.name}</span>
                                </span>
                            ))}
                            {group.sports.length > 3 && (
                                <span className="text-xs text-gray-500 px-3 py-1.5 font-medium">
                                    +{group.sports.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{group.approved_members_count} dalībnieki</span>
                        {group.max_members && (
                            <span className="text-gray-400 font-medium">/ {group.max_members}</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={`/groups/${group.id}`}
                            className="flex-1 text-center px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-all duration-300 font-semibold"
                        >
                            Apskatīt
                        </Link>

                        {isAdmin && (
                            <Link
                                href={`/groups/${group.id}/settings`}
                                className="flex-1 text-center px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
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
        <div key={group.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
            <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                {group.cover_photo_url ? (
                    <img
                        src={group.cover_photo_url}
                        alt={group.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Users className="w-16 h-16 text-gray-400" />
                    </div>
                )}
                {group.is_private && (
                    <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span className="text-xs">Privāta</span>
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2">{group.name}</h3>

                {group.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{group.location}</span>
                    </div>
                )}

                {group.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {group.description}
                    </p>
                )}

                {group.sports.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {group.sports.slice(0, 3).map(sport => (
                            <span key={sport.id} className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                                <span>{sport.icon}</span>
                                <span>{sport.name}</span>
                            </span>
                        ))}
                        {group.sports.length > 3 && (
                            <span className="text-xs text-gray-500 px-3 py-1.5 font-medium">
                                +{group.sports.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{group.approved_members_count} dalībnieki</span>
                    {group.max_members && (
                        <span className="text-gray-400 font-medium">/ {group.max_members}</span>
                    )}
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/groups/${group.id}`}
                        className="flex-1 text-center px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-all duration-300 font-semibold"
                    >
                        Apskatīt
                    </Link>

                    {group.has_pending_request ? (
                        <button
                            disabled
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-semibold"
                        >
                            Gaida apstiprinājumu
                        </button>
                    ) : (
                        <button
                            onClick={() => joinGroup(group.id)}
                            className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                        >
                            Pievienoties
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const filteredPublicGroups = publicGroups.data.filter(group => !group.is_member);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Grupas - SportMatch" />
            <Navbar user={user}/>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Sporta grupas</h1>
                        <p className="text-xl text-gray-600">Pievienojies grupām un atrodi domubiedrus</p>
                    </div>
                    <Link
                        href="/groups/create"
                        className="flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Izveidot grupu</span>
                    </Link>
                </div>

                {myGroups.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manas grupas</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myGroups.map(group => renderMyGroupCard(group))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Meklēt grupas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors font-medium"
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-8 py-3.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                        >
                            Meklēt
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-3.5 border-2 rounded-xl transition-all duration-300 font-semibold ${
                                showFilters ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-900'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filtri</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-8 pt-8 border-t-2 border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        Sporta veids
                                    </label>
                                    <select
                                        value={selectedSport}
                                        onChange={(e) => setSelectedSport(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium"
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
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        <MapPin className="inline w-4 h-4 mr-1" />
                                        Pilsēta
                                    </label>
                                    <div className="relative">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={selectedCity ? selectedCity.name : searchCity}
                                                onChange={(e) => {
                                                    setSearchCity(e.target.value);
                                                    setShowCityDropdown(true);
                                                    if (!e.target.value) {
                                                        setSelectedCityId('');
                                                    }
                                                }}
                                                onFocus={() => setShowCityDropdown(true)}
                                                placeholder="Meklēt pilsētu..."
                                                className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium"
                                            />
                                        </div>

                                        {showCityDropdown && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowCityDropdown(false)}
                                                />
                                                <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                    {filteredCities.length > 0 ? (
                                                        filteredCities.map(city => (
                                                            <div
                                                                key={city.id}
                                                                onClick={() => {
                                                                    setSelectedCityId(city.id.toString());
                                                                    setSearchCity(city.name);
                                                                    setShowCityDropdown(false);
                                                                }}
                                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                                                    selectedCityId === city.id.toString() ? 'bg-blue-50' : ''
                                                                }`}
                                                            >
                                                                <div className="font-medium text-gray-900">{city.name}</div>
                                                                <div className="text-sm text-gray-500">{city.region} reģions</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-2 text-gray-500 text-sm">
                                                            Nav atrasta pilsēta
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-900 transition-all duration-300 font-semibold"
                                    >
                                        Notīrīt filtrus
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Atklāj jaunas grupas</h2>
                    {filteredPublicGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPublicGroups.map(group => renderPublicGroupCard(group))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nav atrasta neviena grupa</h3>
                            <p className="text-gray-600 mb-8 text-lg">Izmēģini citus meklēšanas kritērijus</p>
                            <button
                                onClick={clearFilters}
                                className="px-8 py-3.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                            >
                                Notīrīt filtrus
                            </button>
                        </div>
                    )}
                </div>

                {publicGroups.meta && publicGroups.meta.last_page > 1 && (
                    <div className="mt-12 flex justify-center">
                        <div className="flex space-x-2">
                            {publicGroups.links.map((link: any, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
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
