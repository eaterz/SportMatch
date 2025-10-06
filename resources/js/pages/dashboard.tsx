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
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-gray-600">Ielādē dashboard...</p>
                </div>
            </div>
        );
    }

    const currentDate = new Date();
    const activeUpcomingEvents = upcomingEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        return eventDate >= currentDate;
    });

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

            <Navbar user={user} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                        Sveiks, {user.name}!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Gatavs jaunām sporta aktivitātēm?
                    </p>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">

                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Plus className="w-10 h-10 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Izveidot grupu
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Organizē jaunu sporta aktivitāti un aicini citus pievienoties
                            </p>
                            <button
                                onClick={handleCreateGroup}
                                className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Izveidot jaunu grupu
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-gray-700" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Meklēt grupas
                            </h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Atrodi sporta aktivitātes savā tuvumā un pievienojies
                            </p>
                            <button
                                onClick={handleFindGroups}
                                className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Meklēt aktivitātes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-12">
                    <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-4xl font-bold text-gray-900 mb-2">{myGroups.length}</div>
                        <div className="text-sm font-medium text-gray-600">Manas grupas</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-4xl font-bold text-gray-900 mb-2">{activeUpcomingEvents.length}</div>
                        <div className="text-sm font-medium text-gray-600">Gaidāmie pasākumi</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                            {myGroups.reduce((total, group) => total + group.approved_members_count, 0)}
                        </div>
                        <div className="text-sm font-medium text-gray-600">Kopējie dalībnieki</div>
                    </div>
                </div>

                {/* My Groups */}
                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Manas grupas</h2>
                        {myGroups.length > 0 && (
                            <button
                                onClick={handleFindGroups}
                                className="text-gray-700 hover:text-gray-900 text-sm font-semibold hover:underline"
                            >
                                Skatīt visas
                            </button>
                        )}
                    </div>

                    {myGroups.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium mb-2">Vēl neesi pievienojies nevienai grupai</p>
                            <p className="text-sm text-gray-500 mb-6">
                                Pievienojies esošām grupām vai izveido savu
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleFindGroups}
                                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 font-semibold transition-all duration-300"
                                >
                                    Meklēt grupas
                                </button>
                                <button
                                    onClick={handleCreateGroup}
                                    className="px-6 py-3 border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 rounded-xl font-semibold transition-all duration-300"
                                >
                                    Izveidot grupu
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {myGroups.slice(0, 3).map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => handleGroupClick(group.id)}
                                    className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md cursor-pointer transition-all duration-300"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        {group.sports[0]?.icon ? (
                                            <span className="text-2xl">{group.sports[0].icon}</span>
                                        ) : (
                                            <Users className="w-7 h-7 text-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-gray-900 truncate text-lg">
                                                {group.name}
                                            </h3>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                group.pivot?.role === 'admin'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {getRoleText(group.pivot?.role || 'member')}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {group.approved_members_count}
                                                    {group.max_members && `/${group.max_members}`}
                                                </span>
                                            </div>

                                            {group.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{group.location}</span>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                {group.sports.slice(0, 2).map((sport) => (
                                                    <span key={sport.id} className="text-xs font-medium bg-gray-100 px-2.5 py-1 rounded-lg">
                                                        {sport.name}
                                                    </span>
                                                ))}
                                                {group.sports.length > 2 && (
                                                    <span className="text-xs font-medium text-gray-500">
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
                {activeUpcomingEvents.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gaidāmie pasākumi</h2>
                        <div className="space-y-4">
                            {activeUpcomingEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    onClick={() => handleEventClick(event.id, event.group.id)}
                                    className="flex items-center gap-4 p-5 border-2 border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-md cursor-pointer transition-all duration-300"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-7 h-7 text-white" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate text-lg mb-2">
                                            {event.name}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">{formatDate(event.event_date)}</span>
                                            </div>

                                            {event.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {event.confirmed_participants_count}
                                                    {event.max_participants && `/${event.max_participants}`}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2 font-medium">
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
