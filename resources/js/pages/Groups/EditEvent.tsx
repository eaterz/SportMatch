import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';

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
    is_recurring: boolean;
    recurring_pattern?: string;
    confirmed_participants_count: number;
}

interface Props {
    user: User;
    group: Group;
    event: Event;
}

export default function EditEvent({ user, group, event }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
        duration: event.duration || '',
        max_participants: event.max_participants?.toString() || '',
        price: event.price?.toString() || '',
        is_recurring: event.is_recurring || false,
        recurring_pattern: event.recurring_pattern || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('groups.events.update', [group.id, event.id]));
    };

    const today = new Date().toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Rediģēt pasākumu - ${event.title} - SportMatch`} />

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={route('groups.events.show', [group.id, event.id])}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rediģēt pasākumu</h1>
                        <p className="text-gray-600">{group.name}</p>
                    </div>
                </div>

                {/* Info notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5"></div>
                        <div>
                            <h3 className="font-medium text-yellow-900 mb-1">Uzmanību</h3>
                            <p className="text-sm text-yellow-800">
                                Pasākumam jau ir {event.confirmed_participants_count || 0} dalībnieki.
                                Izmaiņas var ietekmēt viņu dalību, tāpēc viņi tiks informēti par atjauninājumiem.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Pasākuma nosaukums *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                placeholder="Piemēram: Futbola spēle parkā"
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Apraksts
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                placeholder="Pasākuma detaļas, kas dalībniekiem būtu jāzina..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Atrašanās vieta *
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={data.location}
                                onChange={e => setData('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                placeholder="Pilsēta, adrese vai vietas nosaukums"
                                required
                            />
                            {errors.location && (
                                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                            )}
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Datums un laiks *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="event_date"
                                    value={data.event_date}
                                    onChange={e => setData('event_date', e.target.value)}
                                    min={today}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    style={{ colorScheme: 'light' }}
                                    lang="lv"
                                    required
                                />
                                {errors.event_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.event_date}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Ilgums (stundās)
                                </label>
                                <select
                                    id="duration"
                                    value={data.duration}
                                    onChange={e => setData('duration', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                >
                                    <option value="">Nav norādīts</option>
                                    <option value="0.5">30 minūtes</option>
                                    <option value="1">1 stunda</option>
                                    <option value="1.5">1.5 stundas</option>
                                    <option value="2">2 stundas</option>
                                    <option value="2.5">2.5 stundas</option>
                                    <option value="3">3 stundas</option>
                                    <option value="4">4 stundas</option>
                                    <option value="5">5 stundas</option>
                                    <option value="6">6 stundas</option>
                                    <option value="8">8 stundas</option>
                                </select>
                                {errors.duration && (
                                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                                )}
                            </div>
                        </div>

                        {/* Max Participants & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Maksimālais dalībnieku skaits
                                </label>
                                <input
                                    type="number"
                                    id="max_participants"
                                    value={data.max_participants}
                                    onChange={e => setData('max_participants', e.target.value)}
                                    min={event.confirmed_participants_count?.toString() || '2'}
                                    max="200"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Neierobežots"
                                />
                                {errors.max_participants && (
                                    <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>
                                )}
                                {(event.confirmed_participants_count || 0) > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Minimums: {event.confirmed_participants_count || 0} (pašreizējie dalībnieki)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Dalības maksa (€)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={data.price}
                                    onChange={e => setData('price', e.target.value)}
                                    min="0"
                                    max="999.99"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="0.00"
                                />
                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                                )}
                            </div>
                        </div>

                        {/* Recurring - disabled for editing */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-gray-700">Atkārtojošs pasākums</h4>
                                    <p className="text-sm text-gray-600">
                                        {event.is_recurring
                                            ? `Atkārtojas ${event.recurring_pattern === 'weekly' ? 'katru nedēļu' : 'katru mēnesi'}`
                                            : 'Nav atkārtojošs pasākums'
                                        }
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Nav rediģējams
                                </div>
                            </div>
                        </div>

                        {/* Submit buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href={route('groups.events.show', [group.id, event.id])}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                            >
                                Atcelt
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Saglabā...' : 'Saglabāt izmaiņas'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Guidelines */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Rediģēšanas noteikumi</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Visi dalībnieki tiks informēti par izmaiņām pasākumā</li>
                        <li>• Maksimālo dalībnieku skaitu nevar samazināt zem pašreizējā skaita</li>
                        <li>• Pasākuma datumu var mainīt tikai uz nākotni</li>
                        <li>• Atkārtošanas iestatījumus nevar mainīt pēc pasākuma izveides</li>
                        <li>• Ja palielini cenu, dalībnieki var izlemt pamest pasākumu</li>
                    </ul>
                </div>

                {/* Current participants notice */}
                {(event.confirmed_participants_count || 0) > 0 && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <h4 className="font-medium text-gray-900">Pašreizējie dalībnieki</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                            Pasākumam ir {event.confirmed_participants_count} dalībnieki.
                            Viņi saņems paziņojumu par visām izmaiņām.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
