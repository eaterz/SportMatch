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

interface Props {
    user: User;
    group: Group;
}

export default function CreateEvent({ user, group }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        location: '',
        event_date: '',
        duration: '',
        max_participants: '',
        price: '',
        is_recurring: false,
        recurring_pattern: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('groups.events.store', group.id));
    };

    const today = new Date().toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Izveidot pasākumu - ${group.name} - SportMatch`} />

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={route('groups.show', group.id)}
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Izveidot pasākumu</h1>
                        <p className="text-gray-600">{group.name}</p>
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
                                    min="2"
                                    max="200"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    placeholder="Neierobežots"
                                />
                                {errors.max_participants && (
                                    <p className="mt-1 text-sm text-red-600">{errors.max_participants}</p>
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

                        {/* Recurring */}
                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    checked={data.is_recurring}
                                    onChange={e => setData('is_recurring', e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                />
                                <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                                    Atkārtojošs pasākums
                                </label>
                            </div>

                            {data.is_recurring && (
                                <div className="mt-3">
                                    <label htmlFor="recurring_pattern" className="block text-sm font-medium text-gray-700 mb-2">
                                        Atkārtošanas biežums
                                    </label>
                                    <select
                                        id="recurring_pattern"
                                        value={data.recurring_pattern}
                                        onChange={e => setData('recurring_pattern', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                                    >
                                        <option value="">Izvēlies biežumu</option>
                                        <option value="weekly">Katru nedēļu</option>
                                        <option value="monthly">Katru mēnesi</option>
                                    </select>
                                    {errors.recurring_pattern && (
                                        <p className="mt-1 text-sm text-red-600">{errors.recurring_pattern}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit buttons */}
                        <div className="flex gap-4 pt-4">
                            <Link
                                href={route('groups.show', group.id)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                            >
                                Atcelt
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Veido...' : 'Izveidot pasākumu'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Noderīga informācija</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Pēc pasākuma izveides tu automātiski būsi pievienots kā dalībnieks</li>
                        <li>• Visi grupas dalībnieki varēs redzēt un pievienoties pasākumam</li>
                        <li>• Tu varēsi rediģēt pasākuma detaļas līdz pat tā sākumam</li>
                        <li>• Ja norādi maksimālo dalībnieku skaitu, pārējie tiks pievienoti gaidīšanas rindā</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
