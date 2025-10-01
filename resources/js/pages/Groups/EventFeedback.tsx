// File: resources/js/pages/Groups/EventFeedback.tsx
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft, Star, ThumbsUp, ThumbsDown, MapPin,
    Calendar, Users, Award, DollarSign, Send
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    lastname?: string;
}

interface Group {
    id: number;
    name: string;
}

interface Event {
    id: number;
    title: string;
    description?: string;
    location: string;
    event_date: string;
    creator: User;
}

interface Props {
    user: User;
    group: Group;
    event: Event;
}

export default function EventFeedback({ user, group, event }: Props) {
    const [hoveredRating, setHoveredRating] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        rating: 0,
        comment: '',
        would_recommend: true,
        organization_rating: '',
        location_rating: '',
        value_rating: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/groups/${group.id}/events/${event.id}/feedback`, {
            preserveScroll: true,
        });
    };

    const getRatingText = (rating: number) => {
        switch(rating) {
            case 1: return 'Ļoti slikti';
            case 2: return 'Slikti';
            case 3: return 'Vidēji';
            case 4: return 'Labi';
            case 5: return 'Izcili';
            default: return 'Izvēlieties vērtējumu';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <Head title={`Atsauksme - ${event.title} - SportMatch`} />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/groups/${group.id}/events/${event.id}`}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Atstāj atsauksmi</h1>
                        <p className="text-gray-600">Dalies ar savu pieredzi par pasākumu</p>
                    </div>
                </div>

                {/* Event Info Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">{event.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(event.event_date).toLocaleDateString('lv-LV')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>Organizēja: {event.creator.name}</span>
                        </div>
                    </div>
                </div>

                {/* Feedback Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overall Rating */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            Kopējais vērtējums *
                        </label>
                        <div className="flex items-center justify-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setData('rating', star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 ${
                                            star <= (hoveredRating || data.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-gray-600 font-medium">
                            {getRatingText(hoveredRating || data.rating)}
                        </p>
                        {errors.rating && (
                            <p className="text-red-600 text-sm text-center mt-2">{errors.rating}</p>
                        )}
                    </div>

                    {/* Category Ratings */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalizēts vērtējums</h3>

                        <div className="space-y-4">
                            {/* Organization */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Award className="w-4 h-4" />
                                    Organizācija
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['poor', 'fair', 'good', 'excellent'].map((level, index) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setData('organization_rating', level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                                data.organization_rating === level
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {['Slikti', 'Vidēji', 'Labi', 'Izcili'][index]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Vieta
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['poor', 'fair', 'good', 'excellent'].map((level, index) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setData('location_rating', level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                                data.location_rating === level
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {['Slikti', 'Vidēji', 'Labi', 'Izcili'][index]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Value */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4" />
                                    Vērtība par naudu
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['poor', 'fair', 'good', 'excellent'].map((level, index) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setData('value_rating', level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                                data.value_rating === level
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {['Slikti', 'Vidēji', 'Labi', 'Izcili'][index]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                            Vai ieteiktu citiem? *
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setData('would_recommend', true)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    data.would_recommend
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <ThumbsUp className={`w-8 h-8 ${
                                        data.would_recommend ? 'text-green-600' : 'text-gray-400'
                                    }`} />
                                    <span className={`font-medium ${
                                        data.would_recommend ? 'text-green-900' : 'text-gray-600'
                                    }`}>
                                        Jā, ieteiktu
                                    </span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData('would_recommend', false)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    !data.would_recommend
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <ThumbsDown className={`w-8 h-8 ${
                                        !data.would_recommend ? 'text-red-600' : 'text-gray-400'
                                    }`} />
                                    <span className={`font-medium ${
                                        !data.would_recommend ? 'text-red-900' : 'text-gray-600'
                                    }`}>
                                        Nē, neieteiktu
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <label className="block text-lg font-semibold text-gray-900 mb-2">
                            Komentārs
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                            Dalies ar savu pieredzi un ieteikumiem (neobligāti)
                        </p>
                        <textarea
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            rows={5}
                            maxLength={1000}
                            placeholder="Pastāsti par savu pieredzi..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-between items-center mt-2">
                            {errors.comment && (
                                <p className="text-red-600 text-sm">{errors.comment}</p>
                            )}
                            <p className="text-sm text-gray-500 ml-auto">
                                {data.comment.length}/1000
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <Link
                            href={`/groups/${group.id}/events/${event.id}`}
                            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors text-center"
                        >
                            Atcelt
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || data.rating === 0}
                            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            {processing ? 'Sūta...' : 'Nosūtīt atsauksmi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
