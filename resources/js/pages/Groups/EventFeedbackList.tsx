import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft, Star, ThumbsUp, ThumbsDown, User,
    TrendingUp, Award, MapPin, DollarSign, Trash2
} from 'lucide-react';

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
    location: string;
    event_date: string;
    creator: User;
}

interface Feedback {
    id: number;
    rating: number;
    comment?: string;
    would_recommend: boolean;
    organization_rating?: string;
    location_rating?: string;
    value_rating?: string;
    created_at: string;
    user: User;
}

interface FeedbackPagination {
    data: Feedback[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total_feedback: number;
    average_rating: number;
    recommendation_percentage: number;
    rating_distribution: { [key: number]: number };
    category_averages: {
        organization?: number;
        location?: number;
        value?: number;
    };
}

interface Props {
    user: User;
    group: Group;
    event: Event;
    feedback: FeedbackPagination;
    stats: Stats;
    userFeedback?: Feedback;
}

export default function EventFeedbackList({ user, group, event, feedback, stats, userFeedback }: Props) {


    const getRatingLabel = (rating: string) => {
        const labels: { [key: string]: string } = {
            poor: 'Slikti',
            fair: 'Vidēji',
            good: 'Labi',
            excellent: 'Izcili'
        };
        return labels[rating] || rating;
    };

    const getCategoryRatingValue = (rating: string): number => {
        const values: { [key: string]: number } = {
            poor: 1,
            fair: 2,
            good: 3,
            excellent: 4
        };
        return values[rating] || 0;
    };

    const deleteFeedback = async (feedbackId?: number) => {
        if (!feedbackId) return;

        if (!confirm('Vai tiešām vēlaties dzēst šo atsauksmi?')) return;

        try {
            await axios.post(`/groups/${group.id}/events/${event.id}/feedback/${feedbackId}`, {
                _method: 'DELETE',
            });

            router.visit(`/groups/${group.id}/events/${event.id}`, { preserveScroll: true });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Atsauksmes - ${event.title} - SportMatch`} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/groups/${group.id}/events/${event.id}`}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Atsauksmes</h1>
                        <p className="text-gray-600">{event.title}</p>
                    </div>

                    {!userFeedback && (
                        <Link
                            href={`/groups/${group.id}/events/${event.id}/feedback/create`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Atstāt atsauksmi
                        </Link>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Statistics Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Overall Rating */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Kopējais vērtējums</h3>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {stats.average_rating.toFixed(1)}
                                </div>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${
                                                i < Math.round(stats.average_rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Balstīts uz {stats.total_feedback} atsauksmēm
                                </p>
                            </div>
                        </div>

                        {/* Rating Distribution */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Vērtējumu sadalījums</h3>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => {
                                    const count = stats.rating_distribution[rating] || 0;
                                    const percentage = stats.total_feedback > 0
                                        ? (count / stats.total_feedback) * 100
                                        : 0;
                                    return (
                                        <div key={rating} className="flex items-center gap-2">
                                            <span className="text-sm font-medium w-6">{rating}</span>
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Ieteikumi</h3>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">
                                    {stats.recommendation_percentage}%
                                </div>
                                <p className="text-sm text-gray-600">
                                    ieteiktu šo pasākumu citiem
                                </p>
                            </div>
                        </div>

                        {/* Category Ratings */}
                        {(stats.category_averages.organization || stats.category_averages.location || stats.category_averages.value) && (
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Kategoriju vērtējumi</h3>
                                <div className="space-y-3">
                                    {stats.category_averages.organization && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Award className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">Organizācija</span>
                                            </div>
                                            <span className="font-medium">{stats.category_averages.organization.toFixed(1)}/4</span>
                                        </div>
                                    )}
                                    {stats.category_averages.location && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">Vieta</span>
                                            </div>
                                            <span className="font-medium">{stats.category_averages.location.toFixed(1)}/4</span>
                                        </div>
                                    )}
                                    {stats.category_averages.value && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">Vērtība</span>
                                            </div>
                                            <span className="font-medium">{stats.category_averages.value.toFixed(1)}/4</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback List */}
                    <div className="lg:col-span-2 space-y-4">
                        {feedback.data.length > 0 ? (
                            <>
                                {feedback.data.map((item) => (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                        {/* User Info */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                                                    {item.user.profile?.main_photo ? (
                                                        <img
                                                            src={item.user.profile.main_photo}
                                                            alt={item.user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-medium">
                                                            {item.user.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {item.user.name} {item.user.lastname}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(item.created_at).toLocaleDateString('lv-LV', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions for own feedback or admin */}
                                            {(item.user.id === user.id || group.is_admin) && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => deleteFeedback(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < item.rating
                                                                ? 'text-yellow-400 fill-current'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {item.rating}/5
                                            </span>
                                        </div>

                                        {/* Recommendation */}
                                        <div className="flex items-center gap-2 mb-4">
                                            {item.would_recommend ? (
                                                <>
                                                    <ThumbsUp className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm text-green-700 font-medium">
                                                        Iesaka šo pasākumu
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <ThumbsDown className="w-5 h-5 text-red-600" />
                                                    <span className="text-sm text-red-700 font-medium">
                                                        Neiesaka šo pasākumu
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {item.comment && (
                                                <p className="text-gray-700 mb-4 whitespace-pre-wrap break-words">
                                                    {item.comment}
                                                </p>
                                            )}

                                        {/* Category Ratings */}
                                        {(item.organization_rating || item.location_rating || item.value_rating) && (
                                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                                {item.organization_rating && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Award className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Organizācija:</span>
                                                        <span className="font-medium">{getRatingLabel(item.organization_rating)}</span>
                                                    </div>
                                                )}
                                                {item.location_rating && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Vieta:</span>
                                                        <span className="font-medium">{getRatingLabel(item.location_rating)}</span>
                                                    </div>
                                                )}
                                                {item.value_rating && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">Vērtība:</span>
                                                        <span className="font-medium">{getRatingLabel(item.value_rating)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Pagination */}
                                {feedback.last_page > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        {Array.from({ length: feedback.last_page }, (_, i) => i + 1).map((page) => (
                                            <Link
                                                key={page}
                                                href={`/groups/${group.id}/events/${event.id}/feedback?page=${page}`}
                                                className={`px-4 py-2 rounded-lg ${
                                                    page === feedback.current_page
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Vēl nav atsauksmju
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Būsi pirmais, kas dalās ar savu pieredzi!
                                </p>
                                <Link
                                    href={`/groups/${group.id}/events/${event.id}/feedback/create`}
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Atstāt atsauksmi
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
