import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Camera, Upload, Shield, AlertCircle, Check, X, CheckCircle } from 'lucide-react';
import Navbar from '@/components/navbar';

interface Props {
    user: any;
    verificationCode: string;
}

export default function VerificationProcess({ user, verificationCode }: Props) {
    const [step, setStep] = useState(1);
    const [photos, setPhotos] = useState({
        selfie: null as File | null,
        idDocument: null as File | null,
        selfieWithId: null as File | null
    });
    const [previews, setPreviews] = useState({
        selfie: '',
        idDocument: '',
        selfieWithId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const webcamRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            // Check if mediaDevices is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('Tavs pārlūks neatbalsta kameras piekļuvi. Lūdzu, izmanto modernāku pārlūku vai pārbaudi, vai vietne tiek atvērta caur HTTPS.');
                return;
            }

            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setCameraStream(stream);
            setIsCameraActive(true);

            // Wait for next tick to ensure video element is rendered
            setTimeout(() => {
                if (webcamRef.current) {
                    webcamRef.current.srcObject = stream;

                    // Play video once metadata is loaded
                    webcamRef.current.onloadedmetadata = () => {
                        webcamRef.current?.play().catch(err => {
                            console.error('Error playing video:', err);
                        });
                    };
                }
            }, 100);
        } catch (error) {
            console.error('Error accessing camera:', error);

            let errorMessage = 'Nevar piekļūt kamerai.';
            let instructions = '';

            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = '🚫 Kameras piekļuve ir liegta';
                    instructions = '\n\nKā atļaut kameru:\n' +
                        '1. Noklikšķini uz slēdzenes/kameras ikonas adresrindā\n' +
                        '2. Izvēlies "Atļaut" kamerai\n' +
                        '3. Pārlādē lapu\n\n' +
                        'Vai arī pārbaudi pārlūka iestatījumus → Privātums → Kamera';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = '📷 Nav atrasta kamera';
                    instructions = '\n\nPārbaudi:\n' +
                        '- Vai kamera ir pievienota ierīcei\n' +
                        '- Vai cita programma neizmanto kameru\n' +
                        '- Ierīces iestatījumus';
                } else if (error.name === 'NotSupportedError' || error.name === 'NotReadableError') {
                    errorMessage = '⚠️ Kamera nav pieejama';
                    instructions = '\n\nIespējamie risinājumi:\n' +
                        '- Aizver citas programmas, kas izmanto kameru\n' +
                        '- Pārlādē pārlūku\n' +
                        '- Pārbaudi, vai vietne ir atvērta caur HTTPS';
                }
            }

            alert(errorMessage + instructions);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }

        if (webcamRef.current) {
            webcamRef.current.srcObject = null;
        }

        setIsCameraActive(false);
    };

    const takeSelfie = () => {
        console.log('takeSelfie called');
        const video = webcamRef.current;

        if (!video) {
            console.error('Video element not found');
            alert('Kamera nav inicializēta. Lūdzu, mēģini vēlreiz.');
            return;
        }

        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        console.log('Video readyState:', video.readyState);

        // More lenient check - just ensure video has dimensions
        if (!video.videoWidth || !video.videoHeight) {
            console.error('Video dimensions not available');
            alert('Kamera vēl nav gatava. Lūdzu, uzgaidi dažas sekundes un mēģini vēlreiz.');
            return;
        }

        try {
            // Create canvas if it doesn't exist
            let canvas = canvasRef.current;
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvasRef.current = canvas;
            }

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Failed to get canvas context');
                alert('Kļūda inicializējot canvas. Lūdzu, mēģini vēlreiz.');
                return;
            }

            // Clear canvas first
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            console.log('Image drawn to canvas');

            // Convert to blob immediately using a more compatible approach
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob');
                    alert('Kļūda saglabājot foto. Lūdzu, mēģini vēlreiz.');
                    return;
                }

                console.log('Blob created, size:', blob.size);

                const file = new File([blob], `selfie_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                });

                console.log('File created:', file.name, file.size);

                // Create preview URL
                const previewUrl = URL.createObjectURL(blob);

                setPhotos(prev => ({ ...prev, selfie: file }));
                setPreviews(prev => ({ ...prev, selfie: previewUrl }));

                console.log('State updated, stopping camera and moving to step 2');

                // Add a small delay before stopping camera to ensure state is updated
                setTimeout(() => {
                    stopCamera();
                    setStep(2);
                }, 100);
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error('Error taking selfie:', error);
            alert('Kļūda uzņemot foto. Lūdzu, mēģini vēlreiz.');
        }
    };


    const handleFileUpload = (type: 'idDocument' | 'selfieWithId', file: File) => {
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Faila izmērs nedrīkst pārsniegt 10MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Lūdzu, izvēlies attēla failu');
                return;
            }

            setPhotos(prev => ({ ...prev, [type]: file }));

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => ({
                    ...prev,
                    [type]: e.target?.result as string
                }));
            };
            reader.readAsDataURL(file);

            if (type === 'idDocument') {
                setStep(3);
            }
        }
    };

    const submitVerification = async () => {
        if (!photos.selfie || !photos.idDocument) {
            alert('Lūdzu, pievienojiet visas nepieciešamās fotogrāfijas');
            return;
        }

        if (!termsAccepted) {
            alert('Lūdzu, piekrītiet noteikumiem un nosacījumiem');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('selfie', photos.selfie);
            formData.append('id_document', photos.idDocument);
            if (photos.selfieWithId) {
                formData.append('selfie_with_id', photos.selfieWithId);
            }
            formData.append('verification_code', verificationCode);

            router.post('/verification/submit', formData, {
                forceFormData: true,
                onSuccess: () => {
                    // Will redirect to success page
                },
                onError: (errors) => {
                    console.error('Verification submission errors:', errors);
                    setIsSubmitting(false);

                    if (errors.general) {
                        alert(errors.general);
                    } else {
                        alert('Kļūda iesniedzot verifikāciju. Lūdzu, mēģiniet vēlreiz.');
                    }
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            console.error('Error submitting verification:', error);
            setIsSubmitting(false);
            alert('Kļūda iesniedzot verifikāciju. Lūdzu, mēģiniet vēlreiz.');
        }
    };

    React.useEffect(() => {
        return () => {
            stopCamera();
            // Cleanup object URLs to prevent memory leaks
            if (previews.selfie && previews.selfie.startsWith('blob:')) {
                URL.revokeObjectURL(previews.selfie);
            }
            if (previews.selfieWithId && previews.selfieWithId.startsWith('blob:')) {
                URL.revokeObjectURL(previews.selfieWithId);
            }
        };
    }, []);


    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profila verifikācija - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Verificē savu identitāti
                    </h1>
                    <p className="text-lg text-gray-600">
                        Seko soļiem, lai verificētu savu profilu un iegūtu zilo atzīmi
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex justify-between items-center max-w-2xl mx-auto">
                        {[
                            { num: 1, label: 'Selfie' },
                            { num: 2, label: 'ID dokuments' },
                            { num: 3, label: 'Apstiprinājums' }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all duration-300 ${
                                        step >= s.num
                                            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}>
                                        {step > s.num ? <Check className="w-6 h-6" /> : s.num}
                                    </div>
                                    <span className={`text-sm font-medium mt-2 ${
                                        step >= s.num ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {idx < 2 && (
                                    <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
                                        step > s.num ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step 1: Take Selfie */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            1. solis: Uzņem selfie ar verifikācijas kodu
                        </h2>

                        {/* Verification Code Display */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                            <p className="text-sm font-medium text-blue-900 mb-3 text-center">
                                Turi šo kodu redzamā vietā, kad uzņem selfie:
                            </p>
                            <div className="text-5xl font-mono font-bold bg-white text-gray-900 text-center py-6 rounded-xl shadow-inner border-2 border-blue-100">
                                {verificationCode}
                            </div>
                            <p className="text-xs text-blue-800 mt-3 text-center">
                                💡 Vari uzrakstīt to uz papīra vai parādīt citā ierīcē
                            </p>
                        </div>

                        {!isCameraActive ? (
                            <div className="text-center py-12">
                                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Camera className="w-12 h-12 text-gray-400" />
                                </div>
                                <button
                                    onClick={startCamera}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    <Camera className="w-5 h-5" />
                                    Atvērt kameru
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="relative rounded-2xl overflow-hidden bg-black shadow-2xl">
                                    <video
                                        ref={webcamRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full max-h-[500px] object-cover"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        style={{ display: 'none' }}
                                    />
                                    {/* Camera overlay */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 border-4 border-white/20 rounded-2xl m-8"></div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={takeSelfie}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                        disabled={!isCameraActive}
                                    >
                                        📸 Uzņemt foto
                                    </button>

                                    <button
                                        onClick={stopCamera}
                                        className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300"
                                    >
                                        Atcelt
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                            <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2 text-lg">
                                <AlertCircle className="w-5 h-5" />
                                Norādījumi labam rezultātam:
                            </h3>
                            <ul className="space-y-2 text-sm text-yellow-800">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Turi verifikācijas kodu skaidri redzamā vietā</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Pārliecinies, ka seja ir labi apgaismota</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Noņem brilles vai cepuri, ja iespējams</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Skatieties tieši kamerā</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload ID Document */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            2. solis: Augšupielādē ID dokumentu
                        </h2>

                        {previews.selfie && (
                            <div className="mb-8 p-4 bg-green-50 border-2 border-green-200 rounded-2xl flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Check className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-green-900">Selfie veiksmīgi uzņemts!</p>
                                    <p className="text-sm text-green-700">Tagad pievieno savu ID dokumentu</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all duration-300">
                                    {previews.idDocument ? (
                                        <div>
                                            <img
                                                src={previews.idDocument}
                                                alt="ID Document"
                                                className="max-w-full max-h-80 mx-auto rounded-xl shadow-lg"
                                            />
                                            <p className="mt-4 text-sm font-medium text-gray-600">
                                                ✓ Dokuments pievienots. Noklikšķini, lai mainītu
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900 mb-2">
                                                Noklikšķini vai ievelc ID dokumenta foto
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Atbalstīti: Pase, ID karte, vadītāja apliecība
                                            </p>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload('idDocument', file);
                                    }}
                                />
                            </label>

                            {previews.idDocument && (
                                <button
                                    onClick={() => setStep(3)}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    Turpināt uz apstiprināšanu →
                                </button>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                            <h3 className="font-bold text-yellow-900 mb-4 flex items-center gap-2 text-lg">
                                <AlertCircle className="w-5 h-5" />
                                Dokumenta prasības:
                            </h3>
                            <ul className="space-y-2 text-sm text-yellow-800">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Dokumentam jābūt derīgam (nav beidzies termiņš)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Foto un vārds/uzvārds skaidri redzami</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Nav aizklātas dokumenta daļas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-600" />
                                    <span>Kvalitatīva fotogrāfija (nav miglaina)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            3. solis: Pārbaudi un apstipriniet
                        </h2>

                        {/* Photo Review */}
                        <div className="space-y-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-bold text-gray-900">Selfie ar kodu</p>
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    {previews.selfie && (
                                        <img
                                            src={previews.selfie}
                                            alt="Selfie"
                                            className="w-full rounded-xl shadow-md"
                                        />
                                    )}
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-bold text-gray-900">ID dokuments</p>
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    {previews.idDocument && (
                                        <img
                                            src={previews.idDocument}
                                            alt="ID"
                                            className="w-full rounded-xl shadow-md"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Optional: Selfie with ID */}
                            <div className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-gray-300">
                                <p className="text-sm font-bold text-gray-900 mb-3">
                                    ⚡ Papildus: Selfie ar ID dokumentu (neobligāti, bet paātrina procesu)
                                </p>
                                <label className="block">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all duration-300">
                                        {previews.selfieWithId ? (
                                            <img
                                                src={previews.selfieWithId}
                                                alt="Selfie with ID"
                                                className="max-h-40 mx-auto rounded-lg"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                                <span className="text-gray-600 font-medium">Pievienot selfie ar ID</span>
                                                <span className="text-xs text-gray-500">Ievērojami paātrina verifikācijas procesu</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload('selfieWithId', file);
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5" />
                                Privātuma nodrošinājums
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                                    <span>Visas fotogrāfijas tiek šifrētas un droši glabātas</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                                    <span>Dati tiek izmantoti tikai profila verifikācijai</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                                    <span>Pēc verifikācijas dati tiek dzēsti (7 dienu laikā)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
                                    <span>Mēs nekad nedalāmies ar taviem datiem ar trešām pusēm</span>
                                </li>
                            </ul>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="mb-8 bg-gray-50 rounded-2xl p-5 border-2 border-gray-200">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 leading-relaxed">
                                    Es piekrītu, ka <strong>SportMatch</strong> var izmantot manus iesniegttos dokumentus profila verifikācijai.
                                    Es apstiprinu, ka visi iesniegtie dokumenti ir autentiski un pieder man.
                                    Es saprotu, ka nepatiesas informācijas sniegšana var rezultēt ar konta bloķēšanu.
                                </span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300"
                                disabled={isSubmitting}
                            >
                                ← Atgriezties
                            </button>
                            <button
                                onClick={submitVerification}
                                disabled={isSubmitting || !photos.selfie || !photos.idDocument || !termsAccepted}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Nosūta verifikāciju...
                                    </div>
                                ) : (
                                    '🚀 Iesniegt verifikācijai'
                                )}
                            </button>
                        </div>

                        {/* Expected Timeline */}
                        <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                            <h3 className="font-bold text-green-900 mb-4 text-lg">Ko gaidīt tālāk?</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">Pārbaude 1-3 darba dienu laikā</p>
                                        <p className="text-sm text-green-700">Mūsu komanda rūpīgi pārbaudīs tavus dokumentus</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">E-pasta paziņojums</p>
                                        <p className="text-sm text-green-700">Saņemsi ziņu par verifikācijas rezultātu</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">Zilā atzīme profilā</p>
                                        <p className="text-sm text-green-700">Pēc apstiprināšanas profils būs verificēts</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">4</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-green-900">Papildu uzticamība</p>
                                        <p className="text-sm text-green-700">Verificēti lietotāji iegūst augstāku prioritāti kopienā</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.get('/dashboard')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        ← Atgriezties uz sākumlapu
                    </button>
                </div>
            </div>
        </div>
    );
}
