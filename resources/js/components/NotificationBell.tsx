import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Bell, MessageSquare, Users, Calendar, UserPlus, X } from 'lucide-react';
import axios from 'axios';
import echoService from '../services/echo';

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
    userId: number;
    pusherKey?: string;
    pusherCluster?: string;
}

export default function NotificationBell({ userId, pusherKey = '', pusherCluster = 'mt1' }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize real-time notifications
    useEffect(() => {
        if (!pusherKey) return;

        const initializeNotifications = async () => {
            try {
                await echoService.initialize(pusherKey, pusherCluster);

                // Listen to notifications channel
                echoService.listenToNotifications(userId, (notification: any) => {
                    // Add new notification to the top
                    setNotifications(prev => [notification.notification, ...prev].slice(0, 10));
                    setUnreadCount(prev => prev + 1);

                });

                console.log('Notifications WebSocket initialized');
            } catch (error) {
                console.error('Failed to initialize notifications WebSocket:', error);
            }
        };

        initializeNotifications();
        fetchNotifications();

        return () => {
            echoService.leaveChannel(`notifications.${userId}`);
        };
    }, [userId, pusherKey, pusherCluster]);

    // Close dropdown when clicking outside (desktop only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Only close if clicking outside on desktop
            const isDesktop = window.innerWidth >= 768;
            if (isDesktop && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Prevent body scroll when mobile modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/notifications/recent');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: number) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Close the modal/dropdown first
        setIsOpen(false);

        // Then navigate if there's an action URL
        if (notification.action_url) {
            const actionUrl = notification.action_url;
            // Small delay to ensure modal closes before navigation
            setTimeout(() => {
                router.get(actionUrl);
            }, 100);
        }
    };



    // Get icon component based on type
    const getIcon = (iconType: string) => {
        switch (iconType) {
            case 'user-plus':
                return <UserPlus className="w-4 h-4" />;
            case 'message-square':
                return <MessageSquare className="w-4 h-4" />;
            case 'users':
                return <Users className="w-4 h-4" />;
            case 'calendar':
                return <Calendar className="w-4 h-4" />;
            default:
                return <Bell className="w-4 h-4" />;
        }
    };

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Notification Bell Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Desktop Dropdown */}
                {isOpen && (
                    <div className="hidden md:block absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Paziņojumi</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">
                                    Ielādē paziņojumus...
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map(notification => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-start gap-3 ${
                                                !notification.is_read ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className={`p-2 rounded-full ${
                                                !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                                            }`}>
                                                {getIcon(notification.icon)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {notification.created_at}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Nav jaunu paziņojumu</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        router.get('/notifications');
                                        setIsOpen(false);
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Skatīt visus paziņojumus
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Full-Screen Modal */}
            {isOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white sticky top-0">
                        <h3 className="text-lg font-semibold text-gray-900">Paziņojumi</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 -mr-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                Ielādē paziņojumus...
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.map(notification => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left flex items-start gap-3 ${
                                            !notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className={`p-2.5 rounded-full flex-shrink-0 ${
                                            !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            {getIcon(notification.icon)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                {notification.created_at}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8">
                                <Bell className="w-16 h-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-center">Nav jaunu paziņojumu</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-4 border-t border-gray-200 bg-white flex-shrink-0">
                            <button
                                onClick={() => {
                                    router.get('/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center py-3 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 rounded-lg active:bg-blue-100 transition-colors"
                            >
                                Skatīt visus paziņojumus
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
