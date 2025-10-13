import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Calendar, Clock, UserPlus, MessageCircle, Phone, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserType {
    id: number;
    name: string;
    lastname?: string;
    email: string;
}

interface Sport {
    id: number;
    name: string;
    icon: string;
    pivot?: {
        skill_level: string;
        is_preferred: boolean;
    };
}

interface AvailabilitySchedule {
    day_of_week: string;
    start_time: string;
    end_time: string;
}

interface Partner {
    id: number;
    name: string;
    lastname?: string;
    email?: string;
    profile?: {
        age: number;
        location: string;
        bio?: string;
        main_photo?: string;
        phone?: string;
        is_verified?: boolean;
        photos?: Array<{
            id: number;
            photo_url: string;
            is_main: boolean;
        }>;
    };
    sports?: Sport[];
    friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'friends';
    availability_schedules?: AvailabilitySchedule[];
    distance?: number;
}

interface PartnerProfileModalProps {
    partner: Partner;
    isOpen: boolean;
    onClose: () => void;
    onSendFriendRequest: (partnerId: number) => void;
    onStartChat?: (partnerId: number) => void;
}

const PartnerProfileModal: React.FC<PartnerProfileModalProps> = ({
                                                                     partner,
                                                                     isOpen,
                                                                     onClose,
                                                                     onSendFriendRequest,
                                                                     onStartChat
                                                                 }) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        setCurrentPhotoIndex(0);
        setIsTransitioning(false);
    }, [partner.id]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    let photos = partner.profile?.photos || [];

    if (photos.length === 0 && partner.profile?.main_photo) {
        photos = [{
            id: 1,
            photo_url: partner.profile.main_photo,
            is_main: true
        }];
    }

    const hasMultiplePhotos = photos.length > 1;

    const handleSendFriendRequest = () => {
        onSendFriendRequest(partner.id);
        onClose();
    };

    const handlePhotoChange = (newIndex: number) => {
        if (newIndex === currentPhotoIndex || isTransitioning) return;
        setIsTransitioning(true);
        setCurrentPhotoIndex(newIndex);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    const nextPhoto = () => {
        if (currentPhotoIndex < photos.length - 1) {
            handlePhotoChange(currentPhotoIndex + 1);
        }
    };

    const prevPhoto = () => {
        if (currentPhotoIndex > 0) {
            handlePhotoChange(currentPhotoIndex - 1);
        }
    };

    const getSkillLevelLabel = (level: string) => {
        switch (level) {
            case 'beginner': return 'Iesācējs';
            case 'intermediate': return 'Vidējais';
            case 'advanced': return 'Pieredzējis';
            default: return level;
        }
    };

    const getSkillLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDayLabel = (day: string) => {
        const dayLabels: { [key: string]: string } = {
            'monday': 'Pirmdiena',
            'tuesday': 'Otrdiena',
            'wednesday': 'Trešdiena',
            'thursday': 'Ceturtdiena',
            'friday': 'Piektdiena',
            'saturday': 'Sestdiena',
            'sunday': 'Svētdiena'
        };
        return dayLabels[day] || day;
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }
        if (timeString.length === 8 && timeString.includes(':')) {
            return timeString.substring(0, 5);
        }
        try {
            const date = new Date(timeString);
            if (!isNaN(date.getTime())) {
                return date.toLocaleTimeString('lv-LV', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
            }
        } catch (e) {
            console.log('Error parsing time:', timeString);
        }
        return timeString;
    };

    const getFriendshipButton = () => {
        const currentStatus = partner.friendship_status;

        switch (currentStatus) {
            case 'friends':
                return (
                    <button
                        onClick={() => onStartChat?.(partner.id)}
                        className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Sūtīt ziņu</span>
                    </button>
                );
            case 'pending_sent':
                return (
                    <button
                        disabled
                        className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 bg-gray-100 text-gray-500 px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl cursor-not-allowed font-semibold text-sm sm:text-base"
                    >
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Pieprasījums nosūtīts</span>
                    </button>
                );
            case 'pending_received':
                return (
                    <button
                        className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Pieņemt pieprasījumu</span>
                    </button>
                );
            default:
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        className="flex-1 flex items-center justify-center space-x-2 sm:space-x-3 bg-gradient-to-r from-black to-gray-800 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Pievienot draugos</span>
                    </button>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative w-full sm:max-w-5xl h-[95vh] sm:h-auto sm:max-h-[95vh] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">

                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                    <div className="lg:w-2/5 relative flex-shrink-0">
                        <div className="relative h-56 sm:h-72 lg:h-full bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden">
                            {photos.length > 0 ? (
                                <>
                                    <div className="relative w-full h-full overflow-hidden">
                                        <div
                                            className="flex w-full h-full transition-transform duration-300 ease-out"
                                            style={{
                                                transform: `translateX(-${currentPhotoIndex * 100}%)`
                                            }}
                                        >
                                            {photos.map((photo, index) => (
                                                <img
                                                    key={`${photo.id}-${index}`}
                                                    src={photo.photo_url}
                                                    alt={`${partner.name} ${partner.lastname || ''}`}
                                                    className="w-full h-full object-cover flex-shrink-0"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {hasMultiplePhotos && (
                                        <>
                                            {currentPhotoIndex > 0 && (
                                                <button
                                                    onClick={prevPhoto}
                                                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                                                >
                                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </button>
                                            )}
                                            {currentPhotoIndex < photos.length - 1 && (
                                                <button
                                                    onClick={nextPhoto}
                                                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </button>
                                            )}

                                            <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {photos.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePhotoChange(index)}
                                                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                                                            index === currentPhotoIndex
                                                                ? 'bg-white scale-125'
                                                                : 'bg-white/50 hover:bg-white/75'
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 bg-black/50 backdrop-blur-md text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                                                {currentPhotoIndex + 1} / {photos.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-20 h-20 sm:w-32 sm:h-32 text-gray-400" />
                                </div>
                            )}

                            {partner.distance ? (
                                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 bg-black text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                                    {partner.distance} km
                                </div>
                            ) : (<div className="absolute top-3 sm:top-6 right-3 sm:right-6 bg-black text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                                Vienā pilsētā
                            </div>)}
                        </div>
                    </div>

                    <div className="lg:w-3/5 flex flex-col min-h-0 flex-1">
                        <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto">
                            <div className="mb-6">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                                    {partner.name} {partner.lastname || ''}
                                </h1>

                                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-gray-600 text-sm sm:text-base">
                                    {partner.profile?.age && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="font-medium">{partner.profile.age} gadi</span>
                                        </div>
                                    )}
                                    {partner.profile?.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span className="font-medium">{partner.profile.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {partner.profile?.bio && (
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Par mani</h3>
                                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">{partner.profile.bio}</p>
                                </div>
                            )}

                            {partner.sports && partner.sports.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Sporta veidi</h3>
                                    <div className="space-y-3">
                                        {partner.sports.map((sport) => (
                                            <div key={sport.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3 sm:space-x-4">
                                                    <span className="text-2xl sm:text-3xl">{sport.icon}</span>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 text-base sm:text-lg">{sport.name}</span>
                                                        {sport.pivot?.is_preferred ? (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" />
                                                                <span className="text-xs sm:text-sm text-yellow-600 font-medium">Galvenais</span>
                                                            </div>
                                                        ): null}
                                                    </div>
                                                </div>
                                                {sport.pivot?.skill_level && (
                                                    <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getSkillLevelColor(sport.pivot.skill_level)}`}>
                                                        {getSkillLevelLabel(sport.pivot.skill_level)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {partner.availability_schedules && partner.availability_schedules.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Pieejamības grafiks</h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        {partner.availability_schedules.map((schedule, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all">
                                                <span className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg">
                                                    {getDayLabel(schedule.day_of_week)}
                                                </span>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    <span className="font-medium text-xs sm:text-sm lg:text-base">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 lg:p-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
                            <div className="flex gap-3 sm:gap-4">
                                {getFriendshipButton()}
                                <button
                                    onClick={onClose}
                                    className="px-4 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all font-semibold text-sm sm:text-base"
                                >
                                    Aizvērt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerProfileModal;
