import React, { useState, useEffect } from 'react';
import { X, MapPin, Star, Calendar, Clock, UserPlus, MessageCircle, Phone, Mail, User, ChevronLeft, ChevronRight } from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';

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

    // Reset photo index when partner changes
    useEffect(() => {
        setCurrentPhotoIndex(0);
        setIsTransitioning(false);
    }, [partner.id]);

    // Prevent background scroll when modal is open
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

    // Get all photos (if none, use main_photo as fallback)
    let photos = partner.profile?.photos || [];

    // If no photos in the photos array but main_photo exists, create a single photo object
    if (photos.length === 0 && partner.profile?.main_photo) {
        photos = [{
            id: 1,
            photo_url: partner.profile.main_photo,
            is_main: true
        }];
    }

    const hasMultiplePhotos = photos.length > 1;

    const handleSendFriendRequest = () => {
        // Send friend request and close modal
        onSendFriendRequest(partner.id);
        onClose();
    };

    const handlePhotoChange = (newIndex: number) => {
        if (newIndex === currentPhotoIndex || isTransitioning) return;

        setIsTransitioning(true);
        setCurrentPhotoIndex(newIndex);

        // Reset transition state after animation
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

    // Format time properly - handle both HH:mm and HH:mm:ss formats
    const formatTime = (timeString: string) => {
        if (!timeString) return '';

        // If it's already in HH:mm format, return as is
        if (timeString.length === 5 && timeString.includes(':')) {
            return timeString;
        }

        // If it's in HH:mm:ss format, take only HH:mm
        if (timeString.length === 8 && timeString.includes(':')) {
            return timeString.substring(0, 5);
        }

        // Try to parse as datetime and extract time
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
                        className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>Sūtīt ziņu</span>
                    </button>
                );
            case 'pending_sent':
                return (
                    <button
                        disabled
                        className="flex-1 flex items-center justify-center space-x-3 bg-gray-100 text-gray-500 px-8 py-4 rounded-2xl cursor-not-allowed font-semibold"
                    >
                        <Clock className="w-5 h-5" />
                        <span>Pieprasījums nosūtīts</span>
                    </button>
                );
            case 'pending_received':
                return (
                    <button
                        className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Pieņemt pieprasījumu</span>
                    </button>
                );
            default:
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-black to-gray-800 text-white px-8 py-4 rounded-2xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Pievienot draugos</span>
                    </button>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            {/* Backdrop with blur effect */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-all duration-500"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white rounded-3xl shadow-2xl transform transition-all duration-500 scale-100 animate-in zoom-in-95 fade-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 w-12 h-12 bg-black/30 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/50 transition-all duration-300 group"
                >
                    <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                {/* Modal Content */}
                <div className="flex flex-col lg:flex-row h-full max-h-[88vh]">

                    {/* Left Side - Photo Section */}
                    <div className="lg:w-2/5 relative">
                        <div className="relative h-80 lg:h-full bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden">
                            {photos.length > 0 ? (
                                <>
                                    {/* Photo Container with True Carousel Sliding */}
                                    <div className="relative w-full h-full overflow-hidden">
                                        {/* All photos in a horizontal container */}
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
                                                    alt={`${partner.name} ${partner.lastname || ''} - Photo ${index + 1}`}
                                                    className="w-full h-full object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        console.log('Failed to load photo:', photo.photo_url);
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Photo Navigation Controls */}
                                    {hasMultiplePhotos && (
                                        <>
                                            {/* Navigation Arrows */}
                                            {currentPhotoIndex > 0 && (
                                                <button
                                                    onClick={prevPhoto}
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 group"
                                                >
                                                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                                                </button>
                                            )}
                                            {currentPhotoIndex < photos.length - 1 && (
                                                <button
                                                    onClick={nextPhoto}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all duration-300 group"
                                                >
                                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}

                                            {/* Photo Dots Navigation */}
                                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                                {photos.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePhotoChange(index)}
                                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                            index === currentPhotoIndex
                                                                ? 'bg-white scale-125 shadow-lg'
                                                                : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Photo Counter */}
                                            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                                                {currentPhotoIndex + 1} / {photos.length}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                                    <User className="w-32 h-32 text-gray-400" />
                                </div>
                            )}

                            {/* Distance Badge */}
                            {partner.distance && (
                                <div className="absolute top-6 right-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                    {partner.distance} km
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Info Section */}
                    <div className="lg:w-3/5 flex flex-col">
                        <div className="flex-1 p-8 lg:p-10 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">

                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2">
                                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                                    {partner.name} {partner.lastname || ''}
                                </h1>
                                    {partner.profile?.is_verified && (
                                        <VerifiedBadge size="lg" />
                                    )}
                                </div>

                                <div className="flex items-center gap-6 text-gray-600">
                                    {partner.profile?.age && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            <span className="font-medium">{partner.profile.age} gadi</span>
                                        </div>
                                    )}
                                    {partner.profile?.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            <span className="font-medium">{partner.profile.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {partner.profile?.bio && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Par mani</h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">{partner.profile.bio}</p>
                                </div>
                            )}

                            {/* Sports */}
                            {partner.sports && partner.sports.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sporta veidi</h3>
                                    <div className="grid gap-4">
                                        {partner.sports.map((sport) => (
                                            <div key={sport.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-3xl">{sport.icon}</span>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 text-lg">{sport.name}</span>
                                                        {sport.pivot?.is_preferred ? (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                                                                <span className="text-sm text-yellow-600 font-medium">Galvenais sporta veids</span>
                                                            </div>
                                                        ):(null)}
                                                    </div>
                                                </div>
                                                {sport.pivot?.skill_level && (
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getSkillLevelColor(sport.pivot.skill_level)}`}>
                                                        {getSkillLevelLabel(sport.pivot.skill_level)}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Availability Schedule */}
                            {partner.availability_schedules && partner.availability_schedules.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Pieejamības grafiks</h3>
                                    <div className="space-y-3">
                                        {partner.availability_schedules.map((schedule, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                                                <span className="font-semibold text-gray-900 text-lg">
                                                    {getDayLabel(schedule.day_of_week)}
                                                </span>
                                                <div className="flex items-center gap-3 text-gray-700">
                                                    <Clock className="w-5 h-5" />
                                                    <span className="font-medium text-lg">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Action Buttons */}
                        <div className="p-8 lg:p-10 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                            <div className="flex gap-4">
                                {getFriendshipButton()}
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-semibold"
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
