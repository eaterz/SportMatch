import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Send, Search, ArrowLeft, User, Circle, DoorOpen, DoorClosed } from 'lucide-react';
import axios from 'axios';
import echoService from '../services/echo.js';

declare global {
    interface Window {
        Pusher: any;
        Echo: any;
    }
}

interface UserType {
    id: number;
    name: string;
    lastname?: string;
    email: string;
}

interface Profile {
    age?: number;
    location?: string;
    bio?: string;
    main_photo?: string | null;
}

interface Friend {
    id: number;
    name: string;
    lastname?: string;
    profile?: Profile;
    last_message?: {
        message: string;
        created_at: string;
        is_sender: boolean;
    } | null;
    unread_count: number;
    is_online: boolean;
}

interface Message {
    id: number;
    message: string;
    created_at: string;
    date: string;
    is_sender: boolean;
    is_read: boolean;
}

interface Props {
    user: UserType;
    friends: Friend[];
    messages: Message[];
    selectedFriend?: Friend | null;
    pusherKey?: string;
    pusherCluster?: string;
}

export default function Chat({
                                 user,
                                 friends: initialFriends = [],
                                 messages: initialMessages = [],
                                 selectedFriend = null,
                                 pusherKey = '',
                                 pusherCluster = 'mt1'
                             }: Props) {
    const [friends, setFriends] = useState<Friend[]>(initialFriends);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sending, setSending] = useState(false);
    const [currentFriend, setCurrentFriend] = useState<Friend | null>(selectedFriend);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Configure axios defaults
    useEffect(() => {
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.withCredentials = true;

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 419) {
                    console.error('CSRF token mismatch - refreshing page');
                    window.location.reload();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    // Initialize Echo service and listen to chat
    useEffect(() => {
        if (!pusherKey) return;

        const initializeChat = async () => {
            try {
                await echoService.initialize(pusherKey, pusherCluster);

                // Listen to chat messages
                echoService.listenToChat(user.id, handleIncomingMessage);

                console.log('Chat WebSocket initialized');
            } catch (error) {
                console.error('Failed to initialize chat WebSocket:', error);
            }
        };

        initializeChat();

        return () => {
            // Leave only the chat channel when component unmounts
            echoService.leaveChannel(`chat.${user.id}`);
        };
    }, [user.id, pusherKey, pusherCluster]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleIncomingMessage = (data: any) => {
        console.log('Handling incoming message:', data);
        const { message, sender_id, receiver_id } = data;

        // Update messages if this conversation is active
        if (currentFriend && (currentFriend.id === sender_id || currentFriend.id === receiver_id)) {
            const newMsg: Message = {
                id: message.id,
                message: message.message,
                created_at: message.created_at,
                date: message.date,
                is_sender: sender_id === user.id,
                is_read: false
            };

            setMessages(prev => [...prev, newMsg]);

            // Mark as read if receiving
            if (sender_id !== user.id) {
                markMessagesAsRead(sender_id);
            }
        }

        // Update friend list last message
        setFriends(prev => prev.map(friend => {
            if (friend.id === sender_id || friend.id === receiver_id) {
                return {
                    ...friend,
                    last_message: {
                        message: message.message,
                        created_at: new Date().toISOString(),
                        is_sender: sender_id === user.id
                    },
                    unread_count: friend.id === sender_id && currentFriend?.id !== sender_id
                        ? friend.unread_count + 1
                        : friend.unread_count
                };
            }
            return friend;
        }));
    };

    const selectFriend = (friend: Friend) => {
        setCurrentFriend(friend);
        router.get(`/chat/${friend.id}`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                const props = page.props as any;
                setMessages(props.messages || []);
                // Reset unread count
                setFriends(prev => prev.map(f =>
                    f.id === friend.id ? { ...f, unread_count: 0 } : f
                ));
            }
        });
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !currentFriend || sending) return;

        setSending(true);
        const messageText = newMessage;
        setNewMessage('');

        try {
            console.log('Sending message:', messageText);
            const response = await axios.post(`/chat/${currentFriend.id}/send`, {
                message: messageText
            });

            console.log('Message sent response:', response.data);

            if (response.data.success && response.data.message) {
                setMessages(prev => {
                    if (prev.some(msg => msg.id === response.data.message.id)) {
                        return prev; // prevent duplicates
                    }
                    return [...prev, response.data.message];
                });
            }
        } catch (error: any) {
            console.error('Error sending message:', error);

            if (error.response?.status === 403) {
                alert('You can only send messages to friends.');
            } else if (error.response?.status === 419) {
                alert('Session expired. Please refresh the page.');
            } else {
                alert('Failed to send message. Please try again.');
            }

            setNewMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const markMessagesAsRead = async (senderId: number) => {
        try {
            await axios.post(`/chat/${senderId}/read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const filteredFriends = friends.filter(friend =>
        `${friend.name} ${friend.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group messages by date
    const groupedMessages = messages.reduce<Record<string, Message[]>>((groups, message) => {
        const date = message.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    const formatDate = (dateStr: string): string => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dateStr === today) return 'Šodien';
        if (dateStr === yesterday) return 'Vakar';
        return dateStr;
    };

    return (
        <div className="h-screen bg-gray-50 flex">
            <Head title={currentFriend ? `Chat - ${currentFriend.name}` : 'Chat - SportMatch'} />

            {/* Friends Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Čati</h2>
                        <a
                            href="/friends"
                            className="group flex items-center mb-4 gap-3 rounded-2xl bg-white  transition-all duration-300 px-4 py-3"
                        >
                            {/* Default closed door */}
                            <DoorClosed className="h-7 w-7 text-gray-600 group-hover:hidden" />
                            {/* Opens on hover */}
                            <DoorOpen className="h-7 w-7 text-black hidden group-hover:block" />

                        </a>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Meklēt draugus..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                        />
                    </div>
                </div>

                {/* Friends List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredFriends.length > 0 ? (
                        filteredFriends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => selectFriend(friend)}
                                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                    currentFriend?.id === friend.id ? 'bg-gray-100' : ''
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                        {friend.profile?.main_photo ? (
                                            <img
                                                src={friend.profile.main_photo}
                                                alt={friend.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {friend.is_online && (
                                        <Circle className="absolute bottom-0 right-0 w-3 h-3 text-green-500 fill-current" />
                                    )}
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {friend.name} {friend.lastname || ''}
                                        </p>
                                        {friend.unread_count > 0 && (
                                            <span className="bg-black text-white text-xs rounded-full px-2 py-1 ml-2">
                                                {friend.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    {friend.last_message && (
                                        <p className="text-sm text-gray-500 truncate">
                                            {friend.last_message.is_sender && 'Tu: '}
                                            {friend.last_message.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            {searchTerm ? 'Nav atrasts neviens draugs' : 'Nav draugu sarakstā'}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {currentFriend ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                        <button
                            onClick={() => router.get('/friends')}
                            className="md:hidden mr-3"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                            {currentFriend.profile?.main_photo ? (
                                <img
                                    src={currentFriend.profile.main_photo}
                                    alt={currentFriend.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="font-semibold text-gray-900">
                                {currentFriend.name} {currentFriend.lastname || ''}
                            </p>
                            <p className="text-xs text-gray-500">
                                {currentFriend.is_online ? 'Tiešsaistē' : 'Bezsaistē'}
                            </p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <div key={date}>
                                <div className="text-center mb-4">
                                    <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-200">
                                        {formatDate(date)}
                                    </span>
                                </div>
                                {dateMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.is_sender ? 'justify-end' : 'justify-start'} mb-2`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                message.is_sender
                                                    ? 'bg-black text-white'
                                                    : 'bg-white text-gray-900 border border-gray-200'
                                            }`}
                                        >
                                            <p className="break-words">{message.message}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.is_sender ? 'text-gray-300' : 'text-gray-500'
                                            }`}>
                                                {message.created_at}
                                                {message.is_sender && message.is_read && ' ✓✓'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="bg-white border-t border-gray-200 p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Raksti ziņu..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-black"
                                disabled={sending}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sending || !newMessage.trim()}
                                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <User className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Izvēlies draugu</h3>
                        <p className="text-gray-600">Izvēlies draugu no saraksta, lai sāktu čatot</p>
                    </div>
                </div>
            )}
        </div>
    );
}
