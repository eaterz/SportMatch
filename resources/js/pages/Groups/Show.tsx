import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft, MapPin, Users, User, Calendar, MessageSquare, Heart,
    Send, Pin, Trash2, Lock, Globe, Settings,
    UserPlus, ChevronRight
} from 'lucide-react';
import echoService from '@/services/echo.js';

interface User {
    id: number;
    name: string;
    lastname?: string;
    profile?: {
        main_photo?: string;
        location?: string;
    };
}

interface Sport {
    id: number;
    name: string;
    icon: string;
    pivot?: {
        skill_level: string;
    };
}

interface Group {
    id: number;
    name: string;
    description?: string;
    location?: string;
    cover_photo_url?: string;
    is_private: boolean;
    max_members?: number;
    approved_members_count: number;
    creator: User;
    sports: Sport[];
    is_member: boolean;
    is_admin: boolean;
    has_pending_request: boolean;
    approvedMembers?: User[];
}

interface Comment {
    id: number;
    content: string;
    created_at: string;
    user: User;
    post_id: number;
}


interface CommentEvent {
    comment: Comment;
}

interface LikeEvent {
    post_id: number;
    likes_count: number;
    is_liked: boolean;
}

interface Post {
    id: number;
    content: string;
    image?: string;
    is_pinned: boolean;
    is_announcement: boolean;
    likes_count: number;
    comments_count: number;
    is_liked: boolean;
    created_at: string;
    user: User;
    comments?: Comment[];
}

interface Event {
    id: number;
    title: string;
    description?: string;
    location: string;
    event_date: string;
    max_participants?: number;
    confirmed_participants_count: number;
    is_participating: boolean;
    creator: User;
}

interface Props {
    user: User;
    group: Group;
    approvedMembers: User[];
    posts: Post[];
    upcomingEvents: Event[];
    pusherKey?: string;
    pusherCluster?: string;
}

export default function GroupsShow({
                                       user,
                                       group,
                                       approvedMembers,
                                       posts: initialPosts = [],
                                       upcomingEvents = [],
                                       pusherKey = '',
                                       pusherCluster = 'mt1'
                                   }: Props) {
    const [posts, setPosts] = useState(initialPosts);
    const [showPostForm, setShowPostForm] = useState(false);
    const [selectedPost, setSelectedPost] = useState<number | null>(null);

    const { data: postData, setData: setPostData, post: submitPost, processing: processingPost, reset: resetPost } = useForm({
        content: '',
        image: null as File | null,
    });

    const { data: commentData, setData: setCommentData, post: submitComment, processing: processingComment, reset: resetComment } = useForm({
        content: '',
        post_id: null as number | null,
    });

    // Echo service for real-time updates
    useEffect(() => {
        if (!pusherKey) return;

        const initializeGroupWebSocket = async () => {
            try {
                await echoService.initialize(pusherKey, pusherCluster);

                // Listen to group events
                echoService.listenToGroup(group.id, {
                    onPostCreated: (e: { post: Post }) => {
                        setPosts(prev => [e.post, ...prev]);
                    },
                    onPostDeleted: (e: { post_id: number }) => {
                        setPosts(prev => prev.filter(post => post.id !== e.post_id));
                    },
                    onCommentAdded: (e: CommentEvent) => {
                        setPosts(prev => prev.map(post =>
                            post.id === e.comment.post_id
                                ? {
                                    ...post,
                                    comments_count: post.comments_count + 1,
                                    comments: post.comments
                                        ? [e.comment, ...post.comments].slice(0, 3)
                                        : [e.comment]
                                }
                                : post
                        ));
                    },
                    onPostLiked: (e: LikeEvent) => {
                        setPosts(prev => prev.map(post =>
                            post.id === e.post_id
                                ? {
                                    ...post,
                                    likes_count: e.likes_count,
                                    is_liked: e.is_liked
                                }
                                : post
                        ));
                    }
                });

                console.log('Group WebSocket initialized');
            } catch (error) {
                console.error('Failed to initialize group WebSocket:', error);
            }
        };

        initializeGroupWebSocket();

        return () => {
            // Leave group channel when component unmounts
            echoService.leaveChannel(`group.${group.id}`);
        };
    }, [group.id, pusherKey, pusherCluster]);

    const handleJoinGroup = () => {
        router.post(`/groups/${group.id}/join`, {}, {
            preserveScroll: true,
        });
    };

    const handleLeaveGroup = () => {
        if (confirm('Vai tiešām vēlaties pamest šo grupu?')) {
            router.post(`/groups/${group.id}/leave`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitPost(`/groups/${group.id}/posts`, {
            preserveScroll: true,
            onSuccess: () => {
                resetPost();
                setShowPostForm(false);
            }
        });
    };

    const handleCommentSubmit = (postId: number) => {
        submitComment(`/groups/${group.id}/posts/${postId}/comment`, {
            preserveScroll: true,
            onSuccess: () => {
                resetComment();
            }
        });
    };

    const toggleLike = (postId: number) => {
        router.post(`/groups/${group.id}/posts/${postId}/like`, {}, {
            preserveScroll: true,
        });
    };

    const deletePost = (postId: number) => {
        if (confirm('Vai tiešām vēlaties dzēst šo ierakstu?')) {
            router.delete(`/groups/${group.id}/posts/${postId}`, {
                preserveScroll: true,
            });
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('lv-LV', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} min`;
        }
        if (hours < 24) {
            return `${hours}h`;
        }
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`${group.name} - SportMatch`} />

            {/* Cover & Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="relative h-48 md:h-64 bg-gray-100">
                    {group.cover_photo_url ? (
                        <img
                            src={group.cover_photo_url}
                            alt={group.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Back button */}
                    <Link
                        href="/groups"
                        className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-lg hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>

                    {/* Privacy badge */}
                    {group.is_private && (
                        <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span className="text-sm">Privāta</span>
                        </div>
                    )}
                </div>

                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{group.name}</h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                {group.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{group.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{group.approved_members_count} dalībnieki</span>
                                    {group.max_members && (
                                        <span className="text-gray-400">/ {group.max_members}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    {group.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                    <span>{group.is_private ? 'Privāta' : 'Publiska'} grupa</span>
                                </div>
                            </div>

                            {group.description && (
                                <p className="text-gray-600 max-w-2xl">{group.description}</p>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                            {group.is_admin ? (
                                <>
                                    <Link
                                        href={`/groups/${group.id}/settings`}
                                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Pārvaldīt</span>
                                    </Link>
                                    <Link
                                        href={`/groups/${group.id}/members`}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Dalībnieki
                                    </Link>
                                </>
                            ) : group.is_member ? (
                                <>
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Pamest grupu
                                    </button>
                                    <Link
                                        href={`/groups/${group.id}/members`}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Dalībnieki
                                    </Link>
                                </>
                            ) : group.has_pending_request ? (
                                <button
                                    disabled
                                    className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                                >
                                    Gaida apstiprinājumu
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoinGroup}
                                    className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Pievienoties</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sports */}
                    {group.sports.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {group.sports.map(sport => (
                                <span key={sport.id} className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                                    <span>{sport.icon}</span>
                                    <span>{sport.name}</span>
                                    {sport.pivot?.skill_level && sport.pivot.skill_level !== 'all' && (
                                        <span className="text-gray-500">({sport.pivot.skill_level})</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content - Posts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* New post form */}
                        {group.is_member && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                {showPostForm ? (
                                    <form onSubmit={handlePostSubmit}>
                                        <textarea
                                            value={postData.content}
                                            onChange={e => setPostData('content', e.target.value)}
                                            placeholder="Ko tu domā?"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                            rows={3}
                                            required
                                        />
                                        <div className="flex justify-between items-center mt-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowPostForm(false)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                Atcelt
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processingPost || !postData.content.trim()}
                                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                Publicēt
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => setShowPostForm(true)}
                                        className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Uzraksti kaut ko...
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Posts */}
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="bg-white border border-gray-200 rounded-lg">
                                    {/* Post header */}
                                    <div className="p-4 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                {post.user.profile?.main_photo ? (
                                                    <img
                                                        src={post.user.profile.main_photo}
                                                        alt={post.user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                                                        {post.user.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {post.user.name} {post.user.lastname}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatRelativeTime(post.created_at)}
                                                    {post.is_pinned && (
                                                        <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                                                            <Pin className="w-3 h-3" />
                                                            Piesprausts
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {(group.is_admin || post.user.id === user.id) && (
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Post content */}
                                    <div className="px-4 pb-4">
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                    </div>

                                    {/* Post actions */}
                                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                                        <button
                                            onClick={() => toggleLike(post.id)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                                                post.is_liked
                                                    ? 'text-red-600 bg-red-50'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Heart className={`w-4 h-4 ${post.is_liked ? 'fill-current' : ''}`} />
                                            <span className="text-sm">{post.likes_count}</span>
                                        </button>
                                        <button
                                            onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                                            className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="text-sm">{post.comments_count} komentāri</span>
                                        </button>
                                    </div>

                                    {/* Comments section */}
                                    {selectedPost === post.id && (
                                        <div className="px-4 pb-4 border-t border-gray-100">
                                            {/* Existing comments */}
                                            {post.comments && post.comments.length > 0 && (
                                                <div className="space-y-3 mt-3">
                                                    {post.comments.map(comment => (
                                                        <div key={comment.id} className="flex gap-3">
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                                {comment.user.profile?.main_photo ? (
                                                                    <img
                                                                        src={comment.user.profile.main_photo}
                                                                        alt={comment.user.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-medium">
                                                                        {comment.user.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-gray-100 rounded-lg px-3 py-2">
                                                                    <p className="font-medium text-sm text-gray-900">
                                                                        {comment.user.name} {comment.user.lastname}
                                                                    </p>
                                                                    <p className="text-gray-800 text-sm">{comment.content}</p>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1 ml-3">
                                                                    {formatRelativeTime(comment.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {post.comments_count > post.comments.length && (
                                                        <button
                                                            onClick={() => {
                                                                // TODO: Load more comments
                                                                console.log('Load more comments for post', post.id);
                                                            }}
                                                            className="text-sm text-gray-600 hover:text-gray-800 ml-11"
                                                        >
                                                            Skatīt vēl {post.comments_count - post.comments.length} komentārus
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Comment form */}
                                            {group.is_member && (
                                                <div className="flex gap-2 mt-3">
                                                    <input
                                                        type="text"
                                                        value={commentData.post_id === post.id ? commentData.content : ''}
                                                        onChange={e => {
                                                            setCommentData('content', e.target.value);
                                                            setCommentData('post_id', post.id);
                                                        }}
                                                        placeholder="Raksti komentāru..."
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                                                        onKeyPress={e => {
                                                            if (e.key === 'Enter' && commentData.content.trim()) {
                                                                handleCommentSubmit(post.id);
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleCommentSubmit(post.id)}
                                                        disabled={processingComment || !commentData.content.trim()}
                                                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">Vēl nav neviena ieraksta</p>
                                {group.is_member && (
                                    <p className="text-sm text-gray-500 mt-2">Esi pirmais, kas kaut ko uzraksta!</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Upcoming events */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Nākamie pasākumi</h3>
                                {group.is_member && (
                                    <Link
                                        href={`/groups/${group.id}/events/create`}
                                        className="text-sm text-black hover:underline"
                                    >
                                        Izveidot
                                    </Link>
                                )}
                            </div>
                            {upcomingEvents.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <Link
                                            key={event.id}
                                            href={`/groups/${group.id}/events/${event.id}`}
                                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <p className="font-medium text-gray-900 mb-1">{event.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(event.event_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                                <Users className="w-3 h-3" />
                                                <span>{event.confirmed_participants_count} piedalās</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nav plānotu pasākumu</p>
                            )}
                            {upcomingEvents.length > 0 && (
                                <Link
                                    href={`/groups/${group.id}/events`}
                                    className="flex items-center justify-center gap-1 mt-4 text-sm text-black hover:underline"
                                >
                                    Visi pasākumi
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {/* Members preview */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Dalībnieki</h3>
                                <Link
                                    href={`/groups/${group.id}/members`}
                                    className="text-sm text-black hover:underline"
                                >
                                    Visi
                                </Link>
                            </div>
                            {approvedMembers && approvedMembers.length > 0 ? (
                                <div className="grid grid-cols-5 gap-2">
                                    {approvedMembers.slice(0, 10).map(member => (
                                        <div key={member.id} className="relative group">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                                                {member.profile?.main_photo ? (
                                                    <img
                                                        src={member.profile.main_photo}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {member.name} {member.lastname}
                                            </div>
                                        </div>
                                    ))}
                                    {group.approved_members_count > 10 && (
                                        <Link
                                            href={`/groups/${group.id}/members`}
                                            className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            <span className="text-xs">+{group.approved_members_count - 10}</span>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Nav dalībnieku</p>
                            )}
                        </div>

                        {/* Group info */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Par grupu</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span>Izveidoja {group.creator.name} {group.creator.lastname}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    {group.is_private ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                    <span>{group.is_private ? 'Privāta grupa' : 'Publiska grupa'}</span>
                                </div>
                                {group.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{group.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
