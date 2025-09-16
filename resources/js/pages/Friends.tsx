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

    // Filter friends based on search
    const filteredFriends = friends.filter(friend =>
        `${friend.name} ${friend.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.profile?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Friend request actions
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
            router.delete(`/friends/remove/${friendId}`, {
                preserveScroll: true,
            });
        }
        setFriendSettingsOpen(null);
    };

    const startChat = (friendId: number) => {
        // TODO: Implement chat functionality
        router.get(`/chat/${friendId}`);
    };

    const toggleFriendSettings = (friendId: number) => {
        if (friendSettingsOpen === friendId) {
            setFriendSettingsOpen(null);
        } else {
            setFriendSettingsOpen(friendId);
        }
    };

    // Render friend row (Instagram-style)
    const renderFriendRow = (friend: Friend) => (
        <div key={friend.id} className="bg-white border border-gray-200 rounded-lg mb-2 p-3 relative">
            <div className="flex items-center justify-between">
                {/* Left side: Profile photo and name */}
                <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {friend.name} {friend.lastname || ''}
                        </h3>
                        <div className="text-xs text-gray-500 flex items-center">
                            {friend.profile?.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{friend.profile.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Chat button and settings */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => startChat(friend.id)}
                        className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                        aria-label="Chat"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </button>

                    {/* Settings button with its dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => toggleFriendSettings(friend.id)}
                            className="text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Settings"
                            id={`settings-btn-${friend.id}`}
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

            {/* Settings dropdown positioned significantly higher to ensure visibility */}
            {friendSettingsOpen === friend.id && (
                <div
                    className="absolute bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-48"
                    style={{
                        top: '-35px',
                        right: '15px'
                    }}
                >
                    <button
                        onClick={() => removeFriend(friend.id)}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium rounded-lg"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Noņemt draugu</span>
                    </button>
                </div>
            )}
        </div>
    );





    // Render pending request row
    const renderPendingRow = (friend: Friend, type: 'received' | 'sent') => (
        <div key={friend.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-all mb-2 p-3">
            <div className="flex items-center justify-between">
                {/* Left side: Profile photo and name */}
                <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
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
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {friend.name} {friend.lastname || ''}
                        </h3>
                        <div className="text-xs text-gray-500 flex items-center">
                            {friend.profile?.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{friend.profile.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right side: Action buttons */}
                <div className="flex items-center space-x-2">
                    {type === 'received' ? (
                        <>
                            <button
                                onClick={() => acceptRequest(friend.id)}
                                className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors"
                                aria-label="Accept"
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => rejectRequest(friend.id)}
                                className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors"
                                aria-label="Reject"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => cancelRequest(friend.id)}
                            className="bg-gray-100 text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
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
                    <div className="space-y-1">
                        {filteredFriends.map(friend => renderFriendRow(friend))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {searchTerm ? 'Nav atrasti draugi' : 'Tev vēl nav draugu'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm
                                ? 'Izmēģini citu meklēšanas terminu'
                                : 'Atrodi cilvēkus partneru meklēšanā un sūti viņiem draudzības pieprasījumus'
                            }
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => router.get('/partners')}
                                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Meklēt partnerus
                            </button>
                        )}
                    </div>
                );

            case 'received':
                return pendingReceived.length > 0 ? (
                    <div className="space-y-1">
                        {pendingReceived.map(friend => renderPendingRow(friend, 'received'))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <UserPlus className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Nav jaunu pieprasījumu</h3>
                        <p className="text-gray-600">Jaunie draudzības pieprasījumi parādīsies šeit</p>
                    </div>
                );

            case 'sent':
                return pendingSent.length > 0 ? (
                    <div className="space-y-1">
                        {pendingSent.map(friend => renderPendingRow(friend, 'sent'))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Nav nosūtītu pieprasījumu</h3>
                        <p className="text-gray-600">Nosūtītie draudzības pieprasījumi parādīsies šeit</p>
                    </div>
                );
        }
    };

    // The rest of the component remains the same
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Draugi - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Draugi</h1>
                    <p className="text-gray-600">Pārvalda savus draugus un draudzības pieprasījumus</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <Users className="w-8 h-8 text-gray-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{friends.length}</p>
                                <p className="text-sm text-gray-600">Draugi</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <UserPlus className="w-8 h-8 text-gray-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{pendingReceived.length}</p>
                                <p className="text-sm text-gray-600">Jauni pieprasījumi</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                            <Clock className="w-8 h-8 text-gray-600" />
                            <div className="ml-4">
                                <p className="text-2xl font-bold text-gray-900">{pendingSent.length}</p>
                                <p className="text-sm text-gray-600">Nosūtīti</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-gray-200 rounded-lg mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('friends')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                activeTab === 'friends'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Draugi ({friends.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                                activeTab === 'received'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Pieprasījumi ({pendingReceived.length})
                            {pendingReceived.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {pendingReceived.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                                activeTab === 'sent'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-600 hover:text-black'
                            }`}
                        >
                            Nosūtītie ({pendingSent.length})
                        </button>
                    </div>

                    {/* Search bar - only show for friends tab */}
                    {activeTab === 'friends' && friends.length > 0 && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Meklēt draugus..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    {getTabContent()}
                </div>
            </div>
        </div>
    );
}
