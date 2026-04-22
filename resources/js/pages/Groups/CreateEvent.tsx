import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Users, Clock, DollarSign, Search, LoaderCircle } from 'lucide-react';
import { useFormWithErrors } from '@/hooks/useFormWithErrors';

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

interface City {
    id: number;
    name: string;
    region: string;
}

interface Props {
    user: User;
    group: Group;
    cities: City[];
}

export default function CreateEvent({ user, group, cities = [] }: Props) {
    const { data, setField, errors, processing, post } = useFormWithErrors({
        title: '',
        description: '',
        city_id: null as number | null,
        event_date: '',
        duration: '',
        max_participants: '',
        price: '',
        is_recurring: false,
        recurring_pattern: '',
    });

    const [searchCity, setSearchCity] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
        city.region.toLowerCase().includes(searchCity.toLowerCase())
    );

    const selectedCity = cities.find(c => c.id === data.city_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('groups.events.store', group.id), {
            onSuccess: () => {
                window.location.href = route('groups.show', group.id);
            },
        });
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Title */}
                        <div className="grid gap-1">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Pasākuma nosaukums *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={data.title}
                                onChange={e => setField('title', e.target.value)}
                                placeholder="Piemēram: Futbola spēle parkā"
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                maxLength={50}
                            />
                            {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div className="grid gap-1">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Apraksts
                            </label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={e => setField('description', e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Pasākuma detaļas, kas dalībniekiem būtu jāzina..."
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* City */}
                        <div className="grid gap-1">
                            <label className="block text-sm font-medium text-gray-700">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                Pilsēta *
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={selectedCity ? selectedCity.name : searchCity}
                                    onChange={(e) => {
                                        setSearchCity(e.target.value);
                                        setShowCityDropdown(true);
                                        if (!e.target.value) setField('city_id', null);
                                    }}
                                    onFocus={() => setShowCityDropdown(true)}
                                    placeholder="Meklēt pilsētu..."
                                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.city_id ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {showCityDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowCityDropdown(false)} />
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCities.length > 0 ? filteredCities.map(city => (
                                                <div
                                                    key={city.id}
                                                    onClick={() => {
                                                        setField('city_id', city.id);
                                                        setSearchCity(city.name);
                                                        setShowCityDropdown(false);
                                                    }}
                                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${data.city_id === city.id ? 'bg-blue-50' : ''}`}
                                                >
                                                    <div className="font-medium text-gray-900">{city.name}</div>
                                                    <div className="text-sm text-gray-500">{city.region} reģions</div>
                                                </div>
                                            )) : (
                                                <div className="px-4 py-2 text-gray-500 text-sm">Nav atrasta pilsēta</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {errors.city_id && <p className="text-sm text-red-600">{errors.city_id}</p>}
                        </div>

                        {/* Date & Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Datums un laiks *
                                </label>
                                <input
                                    type="datetime-local"
                                    id="event_date"
                                    value={data.event_date}
                                    onChange={e => setField('event_date', e.target.value)}
                                    min={today}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.event_date ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.event_date && <p className="text-sm text-red-600">{errors.event_date}</p>}
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Ilgums (stundās)
                                </label>
                                <select
                                    id="duration"
                                    value={data.duration}
                                    onChange={e => setField('duration', e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
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
                                {errors.duration && <p className="text-sm text-red-600">{errors.duration}</p>}
                            </div>
                        </div>

                        {/* Max Participants & Price */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-1">
                                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Maksimālais dalībnieku skaits
                                </label>
                                <input
                                    type="number"
                                    id="max_participants"
                                    value={data.max_participants}
                                    onChange={e => setField('max_participants', e.target.value)}
                                    min="2"
                                    max="200"
                                    placeholder="Neierobežots"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.max_participants ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.max_participants && <p className="text-sm text-red-600">{errors.max_participants}</p>}
                            </div>

                            <div className="grid gap-1">
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Dalības maksa (€)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={data.price}
                                    onChange={e => setField('price', e.target.value)}
                                    min="0"
                                    max="999.99"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.price && <p className="text-sm text-red-600">{errors.price}</p>}
                            </div>
                        </div>

                        {/* Recurring */}
                        <div className="grid gap-1">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="is_recurring"
                                    checked={data.is_recurring}
                                    onChange={e => setField('is_recurring', e.target.checked)}
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                />
                                <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-700">
                                    Atkārtojošs pasākums
                                </label>
                            </div>

                            {data.is_recurring && (
                                <div className="grid gap-1 mt-2">
                                    <label htmlFor="recurring_pattern" className="block text-sm font-medium text-gray-700">
                                        Atkārtošanas biežums
                                    </label>
                                    <select
                                        id="recurring_pattern"
                                        value={data.recurring_pattern}
                                        onChange={e => setField('recurring_pattern', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:border-gray-400 ${errors.recurring_pattern ? 'border-red-500' : 'border-gray-300'}`}
                                    >
                                        <option value="">Izvēlies biežumu</option>
                                        <option value="weekly">Katru nedēļu</option>
                                        <option value="monthly">Katru mēnesi</option>
                                    </select>
                                    {errors.recurring_pattern && <p className="text-sm text-red-600">{errors.recurring_pattern}</p>}
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 mt-2">
                            <Link
                                href={route('groups.show', group.id)}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-center"
                            >
                                Atcelt
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.city_id || !data.title.trim() || !data.event_date}
                                className="flex-1 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 animate-spin" />
                                        <span>Veido...</span>
                                    </>
                                ) : (
                                    <span>Izveidot pasākumu</span>
                                )}
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
