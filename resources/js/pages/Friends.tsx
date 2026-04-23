import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    MessageCircle,
    Check,
    X,
    Clock,
    Trash2,
    Search,
    User,
    MapPin
} from 'lucide-react';
import Navbar from '@/components/navbar';
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

interface Friend {
    id: number;
    name: string;
    lastname?: string;
    profile?: {
        age: number;
        location: string;
        bio?: string;
        main_photo?: string;
        is_verified: boolean;
    };
    sports?: Sport[];
}

interface Props {
    user: UserType;
    friends: Friend[];
    pendingReceived: Friend[];
    pendingSent: Friend[];
}

export default function Friends({ user, friends = [], pendingReceived = [], pendingSent = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'friends' | 'received' | 'sent'>('friends');
    const [searchTerm, setSearchTerm] = useState('');
    const [friendSettingsOpen, setFriendSettingsOpen] = useState<number | null>(null);

    const filteredFriends = friends.filter(friend =>
        `${friend.name} ${friend.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.profile?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const acceptRequest = (senderId: number) => {
        router.post(`/friends/accept/${senderId}`, {}, {
            preserveScroll: true,
        });
    };

    const rejectRequest = (senderId: number) => {
        router.post(`/friends/reject/${senderId}`, {}, {
            preserveScroll: true,
        });
    };

    const cancelRequest = (receiverId: number) => {
        router.post(`/friends/cancel/${receiverId}`, {}, {
            preserveScroll: true,
        });
    };

    const removeFriend = (friendId: number) => {
        if (confirm('Vai tiešām vēlies noņemt šo draugu?')) {
            router.post(`/friends/remove/${friendId}`, {}, {
                preserveScroll: true,
            });
        }
        setFriendSettingsOpen(null);
    };

    const startChat = (friendId: number) => {
        router.get(`/chat/${friendId}`);
    };

    const toggleFriendSettings = (friendId: number) => {
        if (friendSettingsOpen === friendId) {
            setFriendSettingsOpen(null);
        } else {
            setFriendSettingsOpen(friendId);
        }
    };

    const renderFriendRow = (friend: Friend) => (
        <div key={friend.id} className="bg-white border-2 border-gray-100 rounded-xl p-4 relative hover:border-gray-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {friend.profile?.main_photo ? (
                            <img
                                src={friend.profile.main_photo}
                                alt={`${friend.name} ${friend.lastname || ''}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-7 h-7 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">
                                {friend.name} {friend.lastname || ''}
                            </h3>
                            {friend.profile?.is_verified && (
                                <VerifiedBadge size="sm" />
                            )}
                        </div>
                        {friend.profile?.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-medium">{friend.profile.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => startChat(friend.id)}
                        className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 transition-all duration-300 transform hover:scale-110"
                        aria-label="Chat"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => toggleFriendSettings(friend.id)}
                            className="text-gray-500 p-2.5 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {friendSettingsOpen === friend.id && (
                <div
                    className="absolute bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 w-52"
                    style={{
                        top: '-40px',
                        right: '15px'
                    }}
                >
                    <button
                        onClick={() => removeFriend(friend.id)}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-semibold rounded-xl"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Noņemt draugu</span>
                    </button>
                </div>
            )}
        </div>
    );

    const renderPendingRow = (friend: Friend, type: 'received' | 'sent') => (
        <div key={friend.id} className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                        {friend.profile?.main_photo ? (
                            <img
                                src={friend.profile.main_photo}
                                alt={`${friend.name} ${friend.lastname || ''}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-7 h-7 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                            {friend.name} {friend.lastname || ''}
                        </h3>
                        {friend.profile?.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-medium">{friend.profile.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {type === 'received' ? (
                        <>
                            <button
                                onClick={() => acceptRequest(friend.id)}
                                className="bg-green-100 text-green-700 p-2.5 rounded-full hover:bg-green-200 transition-all duration-300 transform hover:scale-110"
                                aria-label="Accept"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => rejectRequest(friend.id)}
                                className="bg-red-100 text-red-600 p-2.5 rounded-full hover:bg-red-200 transition-all duration-300 transform hover:scale-110"
                                aria-label="Reject"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => cancelRequest(friend.id)}
                            className="bg-gray-100 text-gray-600 p-2.5 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:scale-110"
                            aria-label="Cancel"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const getTabContent = () => {
        switch (activeTab) {
            case 'friends':
                return filteredFriends.length > 0 ? (
                    <div className="space-y-3">
                        {filteredFriends.map(friend => renderFriendRow(friend))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {searchTerm ? 'Nav atrasti draugi' : 'Tev vēl nav draugu'}
                        </h3>
                        <p className="text-gray-600 mb-8 text-lg">
                            {searchTerm
                                ? 'Izmēģini citu meklēšanas terminu'
                                : 'Atrodi cilvēkus partneru meklēšanā un sūti viņiem draudzības pieprasījumus'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => router.get('/partners')}
                                className="bg-black text-white px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold"
                            >
                                Meklēt partnerus
                            </button>
                        )}
                    </div>
                );

            case 'received':
                return pendingReceived.length > 0 ? (
                    <div className="space-y-3">
                        {pendingReceived.map(friend => renderPendingRow(friend, 'received'))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserPlus className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Nav jaunu pieprasījumu</h3>
                        <p className="text-gray-600 text-lg">Jaunie draudzības pieprasījumi parādīsies šeit</p>
                    </div>
                );

            case 'sent':
                return pendingSent.length > 0 ? (
                    <div className="space-y-3">
                        {pendingSent.map(friend => renderPendingRow(friend, 'sent'))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Nav nosūtītu pieprasījumu</h3>
                        <p className="text-gray-600 text-lg">Nosūtītie draudzības pieprasījumi parādīsies šeit</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Draugi - SportMatch" />
            <Navbar user={user} />

            {/* ✅ Changed: max-w-7xl + px-4 sm:px-6 lg:px-8 to match the Navbar container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="mb-10">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Draugi</h1>
                    <p className="text-xl text-gray-600">Pārvalda savus draugus un draudzības pieprasījumus</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-700" />
                            </div>
                            <div className="ml-4">
                                <p className="text-3xl font-bold text-gray-900">{friends.length}</p>
                                <p className="text-sm font-medium text-gray-600">Draugi</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-gray-700" />
                            </div>
                            <div className="ml-4">
                                <p className="text-3xl font-bold text-gray-900">{pendingReceived.length}</p>
                                <p className="text-sm font-medium text-gray-600">Jauni pieprasījumi</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-gray-700" />
                            </div>
                            <div className="ml-4">
                                <p className="text-3xl font-bold text-gray-900">{pendingSent.length}</p>
                                <p className="text-sm font-medium text-gray-600">Nosūtīti</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg mb-8">
                    <div className="flex border-b-2 border-gray-100">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 px-6 py-4 text-center font-bold transition-all duration-300 ${
                                activeTab === 'friends'
                                    ? 'text-black border-b-4 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Draugi ({friends.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`flex-1 px-6 py-4 text-center font-bold transition-all duration-300 relative ${
                                activeTab === 'received'
                                    ? 'text-black border-b-4 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Pieprasījumi ({pendingReceived.length})
                            {pendingReceived.length > 0 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {pendingReceived.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`flex-1 px-6 py-4 text-center font-bold transition-all duration-300 ${
                                activeTab === 'sent'
                                    ? 'text-black border-b-4 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Nosūtītie ({pendingSent.length})
                        </button>
                    </div>

                    {activeTab === 'friends' && friends.length > 0 && (
                        <div className="p-6 border-b-2 border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Meklēt draugus..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors font-medium"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {getTabContent()}
                </div>
            </div>
        </div>
    );
}
