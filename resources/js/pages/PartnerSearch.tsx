import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, MapPin, UserPlus, Clock, Filter, Star, User } from 'lucide-react';
import Navbar from '@/components/navbar';
import PartnerProfileModal from '@/components/PartnerProfileModal';
import VerifiedBadge from '@/components/VerifiedBadge';

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

interface City {
    id: number;
    name: string;
    region: string;
}

interface Partner {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    profile?: {
        age: number;
        location: string;
        bio?: string;
        main_photo?: string;
        phone?: string;
        is_verified?: boolean;
        is_admin?: boolean;
        photos?: Array<{
            id: number;
            photo_url: string;
            is_main: boolean;
        }>;
    };
    sports?: Sport[];
    friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    distance?: number;
}

interface Props {
    user: UserType;
    partners: Partner[];
    sports?: Sport[];
    cities?: City[];
    filters?: {
        search?: string;
        sport?: string;
        skill_level?: string;
        max_distance?: number;
    };
}

export default function PartnerSearch({ user, partners = [], sports = [], cities = [], filters = {} }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSport, setSelectedSport] = useState(filters.sport || '');
    const [selectedSkillLevel, setSelectedSkillLevel] = useState(filters.skill_level || '');
    const [selectedDistance, setSelectedDistance] = useState(filters.max_distance?.toString() || '');
    const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [localPartners, setLocalPartners] = useState(partners);

    React.useEffect(() => {
        setLocalPartners(partners);
    }, [partners]);

    React.useEffect(() => {
        if (selectedPartner) {
            const updatedPartner = localPartners.find(p => p.id === selectedPartner.id);
            if (updatedPartner) {
                setSelectedPartner(updatedPartner);
            }
        }
    }, [localPartners, selectedPartner?.id]);

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

    const visiblePartners = localPartners.filter(
        (partner) =>
            !partner.profile?.is_admin &&
            (partner.friendship_status === 'none' || partner.friendship_status === 'pending_sent')
    );

    const sendFriendRequest = (partnerId: number) => {
        setLocalPartners(prev =>
            prev.map(partner =>
                partner.id === partnerId
                    ? { ...partner, friendship_status: 'pending_sent' as const }
                    : partner
            )
        );

        if (selectedPartner && selectedPartner.id === partnerId) {
            setSelectedPartner(prev => prev ? {
                ...prev,
                friendship_status: 'pending_sent'
            } : null);
        }

        router.post(`/friends/request/${partnerId}`, {}, {
            preserveScroll: true,
            onError: (errors) => {
                setLocalPartners(prev =>
                    prev.map(partner =>
                        partner.id === partnerId
                            ? { ...partner, friendship_status: 'none' as const }
                            : partner
                    )
                );

                if (selectedPartner && selectedPartner.id === partnerId) {
                    setSelectedPartner(prev => prev ? {
                        ...prev,
                        friendship_status: 'none'
                    } : null);
                }
                console.error('Friend request failed:', errors);
            }
        });
    };

    const openPartnerModal = (partner: Partner) => {
        const currentPartner = localPartners.find(p => p.id === partner.id) || partner;
        setSelectedPartner(currentPartner);
        setIsModalOpen(true);
    };

    const closePartnerModal = () => {
        setIsModalOpen(false);
        setSelectedPartner(null);
    };

    const startChat = (partnerId: number) => {
        router.visit(`/chat/${partnerId}`);
    };

    const getFriendshipButton = (partner: Partner) => {
        const currentPartner = localPartners.find(p => p.id === partner.id);
        const currentStatus = currentPartner?.friendship_status || partner.friendship_status;

        switch (currentStatus) {
            case 'pending_sent':
                return (
                    <div className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl cursor-not-allowed font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Nosūtīts</span>
                    </div>
                );

            default:
                return (
                    <button
                        onClick={() => sendFriendRequest(partner.id)}
                        className="w-full flex items-center justify-center space-x-2 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-10">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Meklēt sporta partnerus</h1>
                    <p className="text-xl text-gray-600">Atrodi cilvēkus ar līdzīgām sporta interesēm</p>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Meklēt pēc vārda vai pilsētas..."
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
                            className={`flex items-center space-x-2 px-6 py-3.5 border-2 rounded-xl transition-all duration-300 font-semibold ${
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
                                        data-testid="sport-select"
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
                                        Prasmes līmenis
                                    </label>
                                    <select
                                        value={selectedSkillLevel}
                                        onChange={(e) => setSelectedSkillLevel(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium"
                                    >
                                        <option value="">Visi līmeņi</option>
                                        <option value="beginner">Iesācējs</option>
                                        <option value="intermediate">Vidējais</option>
                                        <option value="advanced">Pieredzējis</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-3">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Attālums (km)
                                    </label>
                                    <select
                                        value={selectedDistance}
                                        onChange={(e) => setSelectedDistance(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium"
                                    >
                                        <option value="">Jebkurš attālums</option>
                                        <option value="5">Līdz 5 km</option>
                                        <option value="10">Līdz 10 km</option>
                                        <option value="25">Līdz 25 km</option>
                                        <option value="50">Līdz 50 km</option>
                                        <option value="100">Līdz 100 km</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
                                <button
                                    onClick={clearFilters}
                                    className="px-6 py-2.5 text-gray-700 hover:text-gray-900 transition-colors font-semibold"
                                >
                                    Notīrīt filtrus
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="px-8 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                                >
                                    Pielietot filtrus
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visiblePartners.length > 0 ? (
                        visiblePartners.map(partner => (
                            <div key={partner.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-gray-300">
                                <div
                                    className="relative h-56 bg-gray-100 cursor-pointer group overflow-hidden"
                                    onClick={() => openPartnerModal(partner)}
                                    id={`partnerModal-${partner.id}`}
                                >
                                    {partner.profile?.main_photo ? (
                                        <img
                                            src={typeof partner.profile.main_photo === 'string'
                                                ? partner.profile.main_photo
                                                : (partner.profile.main_photo as any)?.url || (partner.profile.main_photo as any)?.photo_url || ''}
                                            alt={`${partner.name} ${partner.lastname || ''}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <User className="w-24 h-24 text-gray-400" />
                                        </div>
                                    )}
                                    {partner.distance ? (
                                        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                            {partner.distance} km
                                        </div>
                                    ) : (<div className="absolute top-3 right-3 bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold">
                                        Vienā pilsētā
                                    </div>)}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">Skatīt profilu</span>
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">
                                                {partner.name} {partner.lastname || ''}
                                            </h3>
                                            {partner.profile?.is_verified && (
                                                <VerifiedBadge size="sm" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            {partner.profile?.age && (
                                                <span className="font-medium">{partner.profile.age} gadi</span>
                                            )}
                                            {partner.profile?.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="font-medium">{partner.profile.location}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {partner.profile?.bio && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                            {partner.profile.bio}
                                        </p>
                                    )}

                                    {partner.sports && partner.sports.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-2">
                                                {partner.sports.slice(0, 3).map((sport) => (
                                                    <div key={sport.id} className="flex items-center space-x-1.5 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                                                        <span>{sport.icon}</span>
                                                        <span className="text-gray-700">{sport.name}</span>
                                                        {sport.pivot?.is_preferred ? (
                                                            <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                                                        ):null}
                                                    </div>
                                                ))}
                                                {partner.sports.length > 3 && (
                                                    <span className="text-xs text-gray-500 px-3 py-1.5 font-medium">
                                                        +{partner.sports.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {getFriendshipButton(partner)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nav atrasti partneri</h3>
                            <p className="text-gray-600 mb-8 text-lg">
                                Izmēģini mainīt meklēšanas kritērijus vai filtrus
                            </p>
                            <button
                                onClick={clearFilters}
                                className="bg-black text-white px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                            >
                                Notīrīt filtrus
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedPartner && (
                <PartnerProfileModal
                    partner={selectedPartner}
                    isOpen={isModalOpen}
                    onClose={closePartnerModal}
                    onSendFriendRequest={sendFriendRequest}
                    onStartChat={startChat}
                />
            )}
        </div>
    );
}
