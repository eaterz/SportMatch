import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign,
    Edit, Trash2, UserPlus, UserMinus, User, Star
} from 'lucide-react';
import axios from 'axios';
import { AddToCalendarButton } from '@/components/AddToCalendarButton';
import echoService from '@/services/echo.js';

interface User {
    id: number;
    name: string;
    lastname?: string;
    profile?: {
        main_photo?: string;
    };
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
    city?: {
        id: number;
        name: string;
        region?: string;
    };
    event_date: string;
    duration?: string;
    max_participants?: number;
    price?: number;
    confirmed_participants_count: number;
    is_participating: boolean;
    is_creator: boolean;
    can_edit: boolean;
    creator: User;
    status: string;
    // Feedback properties
    average_rating?: number;
    total_feedback?: number;
    recommendation_percentage?: number;
    user_has_feedback?: boolean;
}

interface Props {
    user: User;
    group: Group;
    event: Event;
    participants: User[];
    pusherKey?: string;
    pusherCluster?: string;
}

export default function EventShow({ user, group, event, participants, pusherKey, pusherCluster  }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('lv-LV', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Fixed useEffect for event deletion listener
    useEffect(() => {
        if (!pusherKey || !pusherCluster) return;

        const initializeEventDeletionListener = async () => {
            try {
                await echoService.initialize(pusherKey, pusherCluster);

                const echo = echoService.getEcho();
                if (!echo) {
                    console.warn('Echo not initialized');
                    return;
                }

                const channelName = `notifications.${user.id}`;

                // Use Laravel Echo's .listen() method with dot prefix (like in the working group example)
                echo.channel(channelName)
                    .listen('.event.deleted', (data: any) => {
                        console.log('🚨 Event deleted event received:', data);

                        // Check if the deleted event is the one we're viewing
                        if (data.event_id === event.id) {
                            // Show alert and redirect immediately
                            alert(`Pasākums "${data.event_title}" tika dzēsts`);
                            router.visit(`/groups/${group.id}/events`);
                        }
                    });

                console.log('✅ Event deletion listener active for channel:', channelName);
            } catch (error) {
                console.error('❌ Failed to initialize event deletion listener:', error);
            }
        };

        initializeEventDeletionListener();

        return () => {
            try {
                const echo = echoService.getEcho();
                if (echo) {
                    // Leave the channel to clean up (like in the working group example)
                    echo.leave(`notifications.${user.id}`);
                    console.log('🧹 Cleaned up event deletion listener');
                }
            } catch (error) {
                console.error('Error cleaning up event deletion listener:', error);
            }
        };
    }, [event.id, user.id, group.id, pusherKey, pusherCluster]);



    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('lv-LV', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventStatus = () => {
        const eventDate = new Date(event.event_date);
        const now = new Date();

        if (eventDate < now) return 'Beidzies';
        if (eventDate.toDateString() === now.toDateString()) return 'Šodien';

        const diffTime = eventDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Rīt';
        if (diffDays < 7) return `${diffDays} dienās`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} nedēļās`;
        return `${Math.ceil(diffDays / 30)} mēnešos`;
    };

    const isEventFull = event.max_participants && event.confirmed_participants_count >= event.max_participants;
    const isEventPast = new Date(event.event_date) < new Date();

    const joinEvent = () => {
        router.post(`/groups/${group.id}/events/${event.id}/join`, {}, {
            preserveScroll: true,
        });
    };

    const leaveEvent = () => {
        if (confirm('Vai tiešām vēlaties pamest šo pasākumu?')) {
            router.post(`/groups/${group.id}/events/${event.id}/leave`, {}, {
                preserveScroll: true,
            });
        }
    };

    const deleteEvent = async () => {
        if (!confirm('Vai tiešām vēlaties dzēst šo pasākumu?')) return;

        try {
            await axios.post(`/groups/${group.id}/events/${event.id}`);

            router.visit(`/groups/${group.id}/events`, { preserveScroll: true });

        } catch (error: any) {
            console.error('Kļūda dzēšot pasākumu:', error);
            alert(error.response?.data?.message || 'Kļūda dzēšot pasākumu');
        } finally {
            setShowDeleteConfirm(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`${event.title} - ${group.name} - SportMatch`} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={route('groups.events', group.id)}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                isEventPast
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-green-100 text-green-700'
                            }`}>
                                {getEventStatus()}
                            </span>
                        </div>
                        <p className="text-gray-600">{group.name}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {event.can_edit && !isEventPast && (
                            <>
                                <Link
                                    href={`/groups/${group.id}/events/${event.id}/edit`}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event details */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">Pasākuma detaļas</h2>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">{formatDate(event.event_date)}</div>
                                        <div className="text-sm text-gray-600">{formatTime(event.event_date)}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                    {event.city ? (
                                        <div className="font-medium text-gray-800">
                                            {event.city.name}
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-sm">Nav norādīta pilsēta</div>
                                    )}
                                </div>

                                {event.duration && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <span>Ilgums: {event.duration}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span>
                                        {event.confirmed_participants_count} dalībnieki
                                        {event.max_participants && ` (maks. ${event.max_participants})`}
                                    </span>
                                </div>

                                {event.price && event.price > 0 && (
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-gray-400" />
                                        <span>Dalības maksa: {event.price}€</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-400" />
                                    <span>Izveidoja: {event.creator.name} {event.creator.lastname}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h2 className="font-semibold text-gray-900 mb-4">Apraksts</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                            </div>
                        )}

                        {/* Participants */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h2 className="font-semibold text-gray-900 mb-4">
                                Dalībnieki ({participants.length})
                            </h2>

                            {participants.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {participants.map(participant => (
                                        <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                {participant.profile?.main_photo ? (
                                                    <img
                                                        src={participant.profile.main_photo}
                                                        alt={participant.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                                        {participant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {participant.name} {participant.lastname}
                                                    {participant.id === event.creator.id && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                            Izveidotājs
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">Nav dalībnieku</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Join/Leave button */}
                        {!isEventPast && (
                            <>
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    {event.is_participating ? (
                                        event.is_creator ? (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <User className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <p className="font-medium text-gray-900 mb-2">Tu esi izveidotājs</p>
                                                <p className="text-sm text-gray-600">Tu nevari pamest pats savu pasākumu</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <UserMinus className="w-8 h-8 text-green-600" />
                                                </div>
                                                <p className="font-medium text-gray-900 mb-4">Tu piedalies</p>
                                                <button
                                                    onClick={leaveEvent}
                                                    className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    Pamest pasākumu
                                                </button>
                                            </div>
                                        )

                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <UserPlus className="w-8 h-8 text-gray-600" />
                                            </div>
                                            <p className="font-medium text-gray-900 mb-4">Pievienoies pasākumam</p>
                                            {isEventFull ? (
                                                <button
                                                    disabled
                                                    className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                                                >
                                                    Pasākums ir pilns
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={joinEvent}
                                                    className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                                >
                                                    Pievienoties
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {event.is_participating && (
                                    <AddToCalendarButton event={event} group={group} />
                                )}
                            </>
                        )}

                        {/* Event stats */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Statistika</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dalībnieki</span>
                                    <span className="font-medium">
                                        {event.confirmed_participants_count}
                                        {event.max_participants && `/${event.max_participants}`}
                                    </span>
                                </div>
                                {event.price && event.price > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Maksa</span>
                                        <span className="font-medium">{event.price}€</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className={`font-medium ${
                                        isEventPast ? 'text-gray-600' : 'text-green-600'
                                    }`}>
                                        {isEventPast ? 'Beidzies' : 'Aktīvs'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section - Only show for past events */}
                        {isEventPast && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Atsauksmes</h3>

                                {event.average_rating && event.average_rating > 0 ? (
                                    <div className="space-y-3">
                                        {/* Average Rating */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Vidējais vērtējums</span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < Math.round(event.average_rating || 0)
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="ml-1 text-sm font-medium">
                                                    {event.average_rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Total feedback count */}
                                        {event.total_feedback !== undefined && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Atsauksmju skaits</span>
                                                <span className="font-medium">{event.total_feedback}</span>
                                            </div>
                                        )}

                                        {/* Recommendation rate */}
                                        {event.recommendation_percentage !== undefined && event.recommendation_percentage !== null && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Iesaka</span>
                                                <span className="font-medium">{event.recommendation_percentage}%</span>
                                            </div>
                                        )}

                                        {/* View all feedback button */}
                                        <Link
                                            href={`/groups/${group.id}/events/${event.id}/feedback`}
                                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center text-sm block mt-3"
                                        >
                                            Skatīt visas atsauksmes
                                        </Link>

                                        {/* Leave feedback button - only for participants who haven't left feedback */}
                                        {event.is_participating && !event.user_has_feedback && (
                                            <Link
                                                href={`/groups/${group.id}/events/${event.id}/feedback/create`}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm block"
                                            >
                                                Atstāt atsauksmi
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <p className="text-gray-500 text-sm mb-3">Vēl nav atsauksmju</p>

                                        {event.is_participating && !event.user_has_feedback && (
                                            <Link
                                                href={`/groups/${group.id}/events/${event.id}/feedback/create`}
                                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm block"
                                            >
                                                Būsi pirmais - atstāj atsauksmi!
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Back to group */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <Link
                                href={route('groups.show', group.id)}
                                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Atpakaļ uz grupu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dzēst pasākumu?</h3>
                        <p className="text-gray-600 mb-6">
                            Šī darbība ir neatgriezeniska. Pasākums tiks dzēsts un visi dalībnieki tiks informēti.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Atcelt
                            </button>
                            <button
                                onClick={deleteEvent}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Dzēst
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
