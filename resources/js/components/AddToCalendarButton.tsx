import React, { useState } from 'react';
import { Calendar, Smartphone, Check, Clock, ExternalLink } from 'lucide-react';

interface CalendarButtonProps {
    event: {
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
    };
    group: {
        id: number;
        name: string;
    };
}

export function AddToCalendarButton({ event, group }: CalendarButtonProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [addedToCalendar, setAddedToCalendar] = useState(false);

    // Format dates for calendar URLs
    const formatDateForCalendar = () => {
        const startDate = new Date(event.event_date);
        const endDate = new Date(startDate);

        if (event.duration) {
            const hours = parseFloat(event.duration);
            endDate.setHours(endDate.getHours() + hours);
        } else {
            endDate.setHours(endDate.getHours() + 2); // Default 2 hours
        }

        return { startDate, endDate };
    };

    // Helper to format the city name for calendar export
    const getEventCity = () => {
        if (event.city) {
            if (event.city.region) {
                return `${event.city.name}, ${event.city.region}`;
            }
            return event.city.name;
        }
        return 'Nezināma vieta'; // Fallback if city missing
    };


    // Generate Google Calendar URL
    const generateGoogleCalendarUrl = () => {
        const { startDate, endDate } = formatDateForCalendar();

        const formatGoogleDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        const details = `${event.description || ''}\n\nGrupa: ${group.name}\n\nOrganizē SportMatch`;

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.title,
            dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
            details: details,
            location: getEventCity(),
            ctz: 'Europe/Riga'
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    };

    // Generate Outlook Web Calendar URL
    const generateOutlookUrl = () => {
        const { startDate, endDate } = formatDateForCalendar();

        const formatOutlookDate = (date: Date) => {
            return date.toISOString();
        };

        const body = `${event.description || ''}\n\nGrupa: ${group.name}\n\nOrganizē SportMatch`;

        const params = new URLSearchParams({
            path: '/calendar/action/compose',
            rru: 'addevent',
            subject: event.title,
            startdt: formatOutlookDate(startDate),
            enddt: formatOutlookDate(endDate),
            location: getEventCity(),
            body: body
        });

        return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
    };

    // Generate Yahoo Calendar URL
    const generateYahooUrl = () => {
        const { startDate, endDate } = formatDateForCalendar();

        const formatYahooDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        const desc = `${event.description || ''} - Grupa: ${group.name} - Organizē SportMatch`;

        const params = new URLSearchParams({
            v: '60',
            title: event.title,
            st: formatYahooDate(startDate),
            et: formatYahooDate(endDate),
            desc: desc,
            in_loc: getEventCity()
        });

        return `https://calendar.yahoo.com/?${params.toString()}`;
    };

    // Generate Apple Calendar URL (for iOS/macOS)
    const generateAppleCalendarUrl = () => {
        const { startDate, endDate } = formatDateForCalendar();

        // Create data URI with calendar event
        const icsContent = generateICSContent(startDate, endDate);
        return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
    };

    // Generate ICS content for Apple devices
    const generateICSContent = (startDate: Date, endDate: Date) => {
        const formatICSDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        };

        const uid = `sportmatch-${event.id}-${Date.now()}@sportmatch.lv`;
        const description = `${event.description || ''} - Grupa: ${group.name}`;

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SportMatch//SportMatch Events//LV
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${getEventCity()}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:SportMatch pasākums sāksies pēc 15 minūtēm!
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Rīt ir SportMatch pasākums: ${event.title}
END:VALARM
END:VEVENT
END:VCALENDAR`;
    };

    // Detect device type
    const detectDevice = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        const platform = navigator.platform?.toLowerCase() || '';

        if (/iphone|ipad|ipod/.test(userAgent) || (platform === 'macintel' && navigator.maxTouchPoints > 1)) {
            return 'ios';
        }
        if (/android/.test(userAgent)) {
            return 'android';
        }
        if (/mac/.test(platform)) {
            return 'mac';
        }
        if (/win/.test(platform)) {
            return 'windows';
        }
        return 'other';
    };

    // Handle calendar add based on device
    const handleAddToCalendar = (type?: string) => {
        const device = detectDevice();
        let url = '';

        if (type) {
            // User selected specific calendar
            switch (type) {
                case 'google':
                    url = generateGoogleCalendarUrl();
                    break;
                case 'outlook':
                    url = generateOutlookUrl();
                    break;
                case 'yahoo':
                    url = generateYahooUrl();
                    break;
                case 'apple':
                    url = generateAppleCalendarUrl();
                    break;
            }
        } else {
            // Auto-detect best option
            switch (device) {
                case 'ios':
                case 'mac':
                    // For Apple devices, show options or use Apple Calendar
                    url = generateAppleCalendarUrl();
                    break;
                case 'android':
                    // For Android, default to Google Calendar
                    url = generateGoogleCalendarUrl();
                    break;
                case 'windows':
                    // For Windows, show options
                    setShowOptions(true);
                    return;
                default:
                    // Show all options
                    setShowOptions(true);
                    return;
            }
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
            setAddedToCalendar(true);
            setTimeout(() => setAddedToCalendar(false), 3000);
        }
    };

    // Try to use native share API (for mobile devices)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                const { startDate, endDate } = formatDateForCalendar();
                const eventDetails = {
                    title: `📅 ${event.title}`,
                    text: `${event.title}\n📍 ${getEventCity()}\n📅 ${new Date(event.event_date).toLocaleString('lv-LV')}\n\nGrupa: ${group.name}`,
                    url: window.location.href
                };

                await navigator.share(eventDetails);
                setAddedToCalendar(true);
                setTimeout(() => setAddedToCalendar(false), 3000);
            } catch (err) {
                console.log('Share failed:', err);
                setShowOptions(true);
            }
        } else {
            handleAddToCalendar();
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Atgādinājums kalendārā
            </h3>

            {!showOptions ? (
                <>
                    {/* Main button */}
                    <button
                        onClick={() => handleNativeShare()}
                        className={`w-full px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            addedToCalendar
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {addedToCalendar ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span>Pievienots kalendāram!</span>
                            </>
                        ) : (
                            <>
                                <Smartphone className="w-5 h-5" />
                                <span>Pievienot kalendāram</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowOptions(true)}
                        className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Izvēlēties citu kalendāru →
                    </button>

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-700">
                                <p className="font-medium mb-1">Automātiski atgādinājumi:</p>
                                <ul className="space-y-0.5">
                                    <li>• 1 dienu pirms pasākuma</li>
                                    <li>• 15 minūtes pirms sākuma</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Calendar options */}
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                handleAddToCalendar('google');
                                setShowOptions(false);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">G</span>
                                </div>
                                <span className="text-gray-700">Google Calendar</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>

                        <button
                            onClick={() => {
                                handleAddToCalendar('outlook');
                                setShowOptions(false);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">O</span>
                                </div>
                                <span className="text-gray-700">Outlook Calendar</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>

                        <button
                            onClick={() => {
                                handleAddToCalendar('apple');
                                setShowOptions(false);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">🍎</span>
                                </div>
                                <span className="text-gray-700">Apple Calendar</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>

                        <button
                            onClick={() => {
                                handleAddToCalendar('yahoo');
                                setShowOptions(false);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">Y!</span>
                                </div>
                                <span className="text-gray-700">Yahoo Calendar</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowOptions(false)}
                        className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Atpakaļ
                    </button>
                </>
            )}

            {addedToCalendar && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 text-center">
                        ✓ Kalendārs atvērts! Apstipriniet pasākuma pievienošanu.
                    </p>
                </div>
            )}
        </div>
    );
}
