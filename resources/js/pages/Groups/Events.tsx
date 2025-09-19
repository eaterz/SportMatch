import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign, Plus, User } from 'lucide-react';

interface User {
    id: number;
    name: string;
    lastname?: string;
}

interface Group {
    id: number;
    name: string;
    is_admin: boolean;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    location: string;
    event_date: string;
    duration?: string;
    max_participants?: number;
    price?: number;
    confirmed_participants_count: number;
    is_participating: boolean;
    creator: User;
    status: string;
}

interface Props {
    user: User;
    group: Group;
    upcomingEvents: Event[];
    pastEvents: Event[];
    is_admin: boolean;
}

export default function Events({ user, group, upcomingEvents, pastEvents, is_admin }: Props) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('lv-LV', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateShort = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('lv-LV', {
            day: 'numeric',
            month: 'short'
        });
    };

    const getRelativeDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Šodien';
        if (diffDays === 1) return 'Rīt';
        if (diffDays < 7) return `${diffDays} dienās`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} nedēļās`;
        return `${Math.ceil(diffDays / 30)} mēnešos`;
    };

    const joinEvent = (eventId: number) => {
        router.post(`/groups/${group.id}/events/${eventId}/join`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Pasākumi - ${group.name} - SportMatch`} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('groups.show', group.id)}
                            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pasākumi</h1>
                            <p className="text-gray-600">{group.name}</p>
                        </div>
                    </div>

                    <Link
                        href={route('groups.events.create', group.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Izveidot pasākumu</span>
                    </Link>
                </div>

                {/* Upcoming Events */}
                <div className="mb-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Nākamie pasākumi ({upcomingEvents.length})
                    </h2>

                    {upcomingEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Event header */}
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                                                {event.title}
                                            </h3>
                                            <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                                {getRelativeDate(event.event_date)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(event.event_date)}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                                            <MapPin className="w-3 h-3" />
                                            <span>{event.location}</span>
                                        </div>

                                        {event.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Event details */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{event.confirmed_participants_count}</span>
                                                    {event.max_participants && (
                                                        <span>/ {event.max_participants}</span>
                                                    )}
                                                </div>
                                                {event.price && event.price > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4" />
                                                        <span>{event.price}€</span>
                                                    </div>
                                                )}
                                                {event.duration && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{event.duration}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                            <User className="w-3 h-3" />
                                            <span>Izveidoja {event.creator.name} {event.creator.lastname}</span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('groups.events.show', [group.id, event.id])}
                                                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm"
                                            >
                                                Detaļas
                                            </Link>
                                            {event.is_participating ? (
                                                <button
                                                    disabled
                                                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm cursor-not-allowed"
                                                >
                                                    Piedalos
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => joinEvent(event.id)}
                                                    className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                                                >
                                                    Pievienoties
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nav plānotu pasākumu</h3>
                            <p className="text-gray-500 mb-6">Esi pirmais, kas izveido kādu interesantu pasākumu!</p>
                            <Link
                                href={route('groups.events.create', group.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Izveidot pasākumu</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Past Events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Iepriekšējie pasākumi
                        </h2>

                        <div className="space-y-4">
                            {pastEvents.map(event => (
                                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 opacity-75">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDateShort(event.event_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    <span>{event.confirmed_participants_count} dalībnieki</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('groups.events.show', [group.id, event.id])}
                                            className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                                        >
                                            Skatīt
                                        </Link>
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
