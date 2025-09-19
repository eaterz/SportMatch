import React from 'react';
import { Head, router } from '@inertiajs/react';
import { Trophy, Users, Search, Plus, Calendar, MapPin, User } from 'lucide-react';

import Navbar from '@/components/navbar';

interface User {
    id: number;
    name: string;
    lastname?: string;
    email: string;
    has_subscription?: boolean;
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
    creator: User;
    sports: Sport[];
    approved_members_count: number;
    max_members?: number;
    is_private: boolean;
    created_at: string;
    pivot?: {
        role: string;
        joined_at: string;
    };
}

interface GroupEvent {
    id: number;
    name: string;
    description?: string;
    event_date: string;
    location?: string;
    group: {
        id: number;
        name: string;
    };
    confirmed_participants_count: number;
    max_participants?: number;
}

interface Props {
    user?: User;
    myGroups?: Group[];
    upcomingEvents?: GroupEvent[];
}

export default function Dashboard({ user, myGroups = [], upcomingEvents = [] }: Props) {
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600">Ielādē dashboard...</p>
                </div>
            </div>
        );
    }

    const handleCreateGroup = () => {
        router.get('/groups/create');
    };

    const handleFindGroups = () => {
        router.get('/groups');
    };

    const handleGroupClick = (groupId: number) => {
        router.get(`/groups/${groupId}`);
    };

    const handleEventClick = (eventId: number, groupId: number) => {
        router.get(`/groups/${groupId}/events/${eventId}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('lv-LV', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleText = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Administrators';
            case 'member':
                return 'Dalībnieks';
            default:
                return 'Dalībnieks';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Dashboard - SportMatch" />

            {/* Use Navbar Component */}
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Sveiks, {user.name}!
                    </h1>
                    <p className="text-gray-600">
                        Gatavs jaunām sporta aktivitātēm?
                    </p>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Create Group Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Izveidot grupu
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Organizē jaunu sporta aktivitāti un aicini citus pievienoties
                            </p>
                            <button
                                onClick={handleCreateGroup}
                                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors"
                            >
                                Izveidot jaunu grupu
                            </button>
                        </div>
                    </div>

                    {/* Find Groups Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Meklēt grupas
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Atrodi sporta aktivitātes savā tuvumā un pievienojies
                            </p>
                            <button
                                onClick={handleFindGroups}
                                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors "
                            >
                                Meklēt aktivitātes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-black">{myGroups.length}</div>
                        <div className="text-sm text-gray-600">Manas grupas</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-black">{upcomingEvents.length}</div>
                        <div className="text-sm text-gray-600">Gaidāmie pasākumi</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-black">
                            {myGroups.reduce((total, group) => total + group.approved_members_count, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Kopējie dalībnieki</div>
                    </div>
                </div>

                {/* My Groups */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Manas grupas</h2>
                        {myGroups.length > 0 && (
                            <button
                                onClick={handleFindGroups}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                Skatīt visas
                            </button>
                        )}
                    </div>

                    {myGroups.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 mb-4">Vēl neesi pievienojies nevienai grupai</p>
                            <p className="text-sm text-gray-400 mb-4">
                                Pievienojies esošām grupām vai izveido savu
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleFindGroups}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                                >
                                    Meklēt grupas
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                                >
                                    Izveidot grupu
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myGroups.slice(0, 3).map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => handleGroupClick(group.id)}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        {group.sports[0]?.icon ? (
                                            <span className="text-xl">{group.sports[0].icon}</span>
                                        ) : (
                                            <Users className="w-6 h-6 text-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {group.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                group.pivot?.role === 'admin'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {getRoleText(group.pivot?.role || 'member')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {group.approved_members_count}
                                                    {group.max_members && `/${group.max_members}`}
                                                </span>
                                            </div>

                                            {group.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{group.location}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-1">
                                                {group.sports.slice(0, 2).map((sport) => (
                                                    <span key={sport.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                        {sport.name}
                                                    </span>
                                                ))}
                                                {group.sports.length > 2 && (
                                                    <span className="text-xs text-gray-400">
                                                        +{group.sports.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Gaidāmie pasākumi</h2>
                        <div className="space-y-3">
                            {upcomingEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => handleEventClick(event.id, event.group.id)}
                                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {event.name}
                                        </h3>

                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{formatDate(event.event_date)}</span>
                                            </div>

                                            {event.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {event.confirmed_participants_count}
                                                    {event.max_participants && `/${event.max_participants}`}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {event.group.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
