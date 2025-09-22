import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { Bell, MessageSquare, Users, Calendar, UserPlus, Trash2, Check, CheckCheck } from 'lucide-react';
import Navbar from '@/components/navbar';
import axios from 'axios';

interface Notification {
    id: number;
    type: string;
    message: string;
    icon: string;
    action_url?: string;
    is_read: boolean;
    created_at: string;
    data: any;
}

interface Props {
    user: any;
    notifications: {
        data: Notification[];
        links: any;
        meta: any;
    };
    unread_count: number;
}

export default function NotificationsIndex({ user, notifications, unread_count }: Props) {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

    const getIcon = (iconType: string) => {
        switch (iconType) {
            case 'user-plus':
                return <UserPlus className="w-5 h-5" />;
            case 'message-square':
                return <MessageSquare className="w-5 h-5" />;
            case 'users':
                return <Users className="w-5 h-5" />;
            case 'calendar':
                return <Calendar className="w-5 h-5" />;
            default:
                return <Bell className="w-5 h-5" />;
        }
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            router.reload({ only: ['notifications', 'unread_count'] });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true
        });
    };

    const deleteNotification = (notificationId: number) => {
        router.delete(`/notifications/${notificationId}`, {
            preserveScroll: true
        });
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        if (notification.action_url) {
            router.get(notification.action_url);
        }
    };

    const toggleSelectNotification = (notificationId: number) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const deleteSelected = () => {
        if (selectedNotifications.length === 0) return;

        if (confirm(`Vai tiešām vēlaties dzēst ${selectedNotifications.length} paziņojumus?`)) {
            selectedNotifications.forEach(id => {
                router.delete(`/notifications/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSelectedNotifications([]);
                    }
                });
            });
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'friend_request':
            case 'friend_request_accepted':
                return 'bg-blue-100 text-blue-600';
            case 'new_message':
                return 'bg-green-100 text-green-600';
            case 'group_post_comment':
                return 'bg-purple-100 text-purple-600';
            case 'group_event_created':
            case 'group_event_reminder':
                return 'bg-orange-100 text-orange-600';
            case 'group_member_joined':
            case 'group_invitation':
                return 'bg-indigo-100 text-indigo-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Paziņojumi - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Paziņojumi</h1>
                    <p className="text-gray-600">
                        {unread_count > 0
                            ? `Tev ir ${unread_count} nelasīti paziņojumi`
                            : 'Visi paziņojumi ir izlasīti'
                        }
                    </p>
                </div>

                {/* Actions Bar */}
                {notifications.data.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {selectedNotifications.length > 0 && (
                                <>
                                    <span className="text-sm text-gray-600">
                                        {selectedNotifications.length} izvēlēti
                                    </span>
                                    <button
                                        onClick={deleteSelected}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Dzēst izvēlētos
                                    </button>
                                </>
                            )}
                        </div>

                        {unread_count > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Atzīmēt visus kā lasītus
                            </button>
                        )}
                    </div>
                )}

                {/* Notifications List */}
                {notifications.data.length > 0 ? (
                    <div className="space-y-2">
                        {notifications.data.map(notification => (
                            <div
                                key={notification.id}
                                className={`bg-white border rounded-lg transition-all hover:shadow-md ${
                                    !notification.is_read
                                        ? 'border-blue-200 bg-blue-50/30'
                                        : 'border-gray-200'
                                }`}
                            >
                                <div className="p-4 flex items-start gap-4">
                                    {/* Checkbox */}
                                    <div className="pt-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.includes(notification.id)}
                                            onChange={() => toggleSelectNotification(notification.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Icon */}
                                    <div className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                                        {getIcon(notification.icon)}
                                    </div>

                                    {/* Content */}
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium">
                                                    {notification.message}
                                                </p>

                                                {/* Additional details based on type */}
                                                {notification.type === 'new_message' && notification.data.message_preview && (
                                                    <p className="text-sm text-gray-600 mt-1 italic">
                                                        "{notification.data.message_preview}"
                                                    </p>
                                                )}

                                                {notification.type === 'group_event_created' && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        <p>📅 {notification.data.event_date}</p>
                                                        <p>📍 {notification.data.event_location}</p>
                                                    </div>
                                                )}

                                                {notification.type === 'group_post_comment' && notification.data.comment_preview && (
                                                    <p className="text-sm text-gray-600 mt-1 italic">
                                                        "{notification.data.comment_preview}"
                                                    </p>
                                                )}

                                                <p className="text-xs text-gray-500 mt-2">
                                                    {notification.created_at}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-1">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(notification.id);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                            title="Atzīmēt kā lasītu"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Dzēst"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions for specific notification types */}
                                {notification.type === 'friend_request' && !notification.data.is_accepted && (
                                    <div className="px-4 pb-4 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.get('/friends');
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            Skatīt pieprasījumu
                                        </button>
                                    </div>
                                )}

                                {notification.type === 'group_invitation' && (
                                    <div className="px-4 pb-4 flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.get(`/groups/${notification.data.group_id}`);
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                        >
                                            Skatīt grupu
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Nav paziņojumu</h3>
                        <p className="text-gray-600 mb-6">
                            Kad būs jauni paziņojumi, tie parādīsies šeit
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Atgriezties uz sākumu
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {notifications.meta && notifications.meta.last_page > 1 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex space-x-2">
                            {notifications.links.map((link: any, index: number) => (
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
