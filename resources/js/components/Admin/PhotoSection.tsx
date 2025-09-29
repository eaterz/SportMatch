import React, { useState } from 'react';
import { AlertCircle, Maximize2, X } from 'lucide-react';

interface PhotoSectionProps {
    title: string;
    photoUrl?: string | null;
    code?: string;
    optional?: boolean;
}

export function PhotoSection({ title, photoUrl, code, optional }: PhotoSectionProps) {
    const [imageError, setImageError] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <>
            <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{title}</h4>
                    {optional && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Papildus</span>
                    )}
                </div>

                {code && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            Verifikācijas kods: <span className="font-mono font-bold text-xl ml-2">{code}</span>
                        </p>
                    </div>
                )}

                <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
                    {photoUrl && !imageError ? (
                        <>
                            <img
                                src={photoUrl}
                                alt={title}
                                className="w-full h-auto cursor-zoom-in"
                                onClick={() => setFullscreen(true)}
                                onError={() => setImageError(true)}
                            />
                            <button
                                onClick={() => setFullscreen(true)}
                                className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg hover:bg-white transition-colors"
                            >
                                <Maximize2 className="w-4 h-4 text-gray-700" />
                            </button>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Nevar ielādēt attēlu</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Modal */}
            {fullscreen && photoUrl && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreen(false)}>
                    <button
                        onClick={() => setFullscreen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <img
                        src={photoUrl}
                        alt={title}
                        className="max-w-full max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
