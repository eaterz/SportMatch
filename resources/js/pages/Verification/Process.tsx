import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Camera, Upload, Shield, AlertCircle, Check, X } from 'lucide-react';
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
            const constraints = {
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
                setCameraStream(stream);
                setIsCameraActive(true);

                // Wait for video to be ready
                webcamRef.current.onloadedmetadata = () => {
                    webcamRef.current?.play();
                };
            }
        } catch (error) {
            console.error('Error accessing camera:', error);

            let errorMessage = 'Nevar piekļūt kamerai.';
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Lūdzu, atļauj piekļuvi kamerai savā pārlūkā.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'Nav atrasta kamera. Lūdzu, pārbaudi ierīci.';
                } else if (error.name === 'NotSupportedError') {
                    errorMessage = 'Kamera netiek atbalstīta šajā pārlūkā.';
                }
            }

            alert(errorMessage);
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
        if (!webcamRef.current || !webcamRef.current.videoWidth) {
            alert('Kamera vēl nav gatava. Lūdzu, uzgaidi.');
            return;
        }

        // Create canvas element if not exists
        let canvas = canvasRef.current;
        if (!canvas) {
            canvas = document.createElement('canvas');
        }

        const video = webcamRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Draw the current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'selfie.jpg', {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });

                    setPhotos(prev => ({ ...prev, selfie: file }));
                    setPreviews(prev => ({ ...prev, selfie: canvas.toDataURL('image/jpeg', 0.8) }));

                    stopCamera();
                    setStep(2);
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const handleFileUpload = (type: 'idDocument' | 'selfieWithId', file: File) => {
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Faila izmērs nedrīkst pārsniegt 10MB');
                return;
            }

            // Validate file type
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

    // Cleanup camera on component unmount
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Profila verifikācija - SportMatch" />
            <Navbar user={user} />

            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <Shield className="w-16 h-16 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verificē savu identitāti
                    </h1>
                    <p className="text-gray-600">
                        Seko soļiem, lai verificētu savu profilu un iegūtu zilo atzīmi
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex justify-between items-center max-w-md mx-auto">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                    step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                                }`}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${
                                        step > s ? 'bg-blue-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 max-w-md mx-auto text-xs text-gray-600">
                        <span>Selfie</span>
                        <span>ID dokuments</span>
                        <span>Apstiprinājums</span>
                    </div>
                </div>

                {/* Step 1: Take Selfie */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            1. solis: Uzņem selfie ar verifikācijas kodu
                        </h2>

                        {/* Verification Code Display */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800 mb-2">
                                Turi šo kodu redzamā vietā, kad uzņem selfie:
                            </p>
                            <div className="text-3xl font-mono font-bold text-blue-900 text-center py-2">
                                {verificationCode}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                                Vari uzrakstīt to uz papīra vai parādīt citā ierīcē
                            </p>
                        </div>


                            <div className="text-center">
                                <button
                                    onClick={startCamera}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    <Camera className="w-5 h-5" />
                                    Atvērt kameru
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative rounded-lg overflow-hidden bg-black">
                                    <video
                                        ref={webcamRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full max-h-96 object-cover"
                                    />
                                    {/* Hidden canvas for photo capture */}
                                    <canvas
                                        ref={canvasRef}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={takeSelfie}
                                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                        disabled={!webcamRef.current}
                                    >
                                        Uzņemt foto
                                    </button>
                                    <button
                                        onClick={stopCamera}
                                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Atcelt
                                    </button>
                                </div>
                            </div>


                        {/* Instructions */}
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Norādījumi:
                            </h3>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Turi verifikācijas kodu skaidri redzamā vietā</li>
                                <li>• Pārliecinies, ka seja ir labi apgaismota</li>
                                <li>• Noņem brilles vai cepuri, ja iespējams</li>
                                <li>• Skatieties tieši kamerā</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 2: Upload ID Document */}
                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            2. solis: Augšupielādē ID dokumentu
                        </h2>

                        {previews.selfie && (
                            <div className="mb-6 p-4 bg-green-50 rounded-lg flex items-center gap-3">
                                <Check className="w-5 h-5 text-green-600" />
                                <span className="text-green-800">Selfie veiksmīgi uzņemts</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 cursor-pointer">
                                    {previews.idDocument ? (
                                        <div>
                                            <img
                                                src={previews.idDocument}
                                                alt="ID Document"
                                                className="max-w-full max-h-64 mx-auto rounded"
                                            />
                                            <p className="mt-3 text-sm text-gray-600">
                                                Noklikšķini, lai mainītu
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-600">
                                                Noklikšķini vai ievelc ID dokumenta foto
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
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
                                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Turpināt
                                </button>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-medium text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Prasības:
                            </h3>
                            <ul className="text-sm text-yellow-800 space-y-1">
                                <li>• Dokumentam jābūt derīgam (nav beidzies termiņš)</li>
                                <li>• Foto un vārds/uzvārds skaidri redzami</li>
                                <li>• Nav aizklātas dokumenta daļas</li>
                                <li>• Kvalitatīva fotogrāfija (nav miglaina)</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            3. solis: Apstiprinājums
                        </h2>

                        {/* Photo Review */}
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Selfie ar kodu</p>
                                    {previews.selfie && (
                                        <img
                                            src={previews.selfie}
                                            alt="Selfie"
                                            className="w-full rounded-lg border"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">ID dokuments</p>
                                    {previews.idDocument && (
                                        <img
                                            src={previews.idDocument}
                                            alt="ID"
                                            className="w-full rounded-lg border"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Optional: Selfie with ID */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Papildus: Selfie ar ID dokumentu (neobligāti, bet paātrina procesu)
                                </p>
                                <label className="block">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 cursor-pointer">
                                        {previews.selfieWithId ? (
                                            <img
                                                src={previews.selfieWithId}
                                                alt="Selfie with ID"
                                                className="max-h-32 mx-auto rounded"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-600">Pievienot selfie ar ID</span>
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Privātuma nodrošinājums
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Visas fotogrāfijas tiek šifrētas un droši glabātas</li>
                                <li>• Dati tiek izmantoti tikai profila verifikācijai</li>
                                <li>• Pēc verifikācijas dati tiek dzēsti (7 dienu laikā)</li>
                                <li>• Mēs nekad nedalāmies ar taviem datiem ar trešām pusēm</li>
                            </ul>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="mb-6">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                />
                                <span className="text-sm text-gray-700">
                                    Es piekrītu, ka SportMatch var izmantot manus iesniegttos dokumentus profila verifikācijai.
                                    Es apstiprinu, ka visi iesniegtie dokumenti ir autentiski un pieder man.
                                    Es saprotu, ka nepatiesas informācijas sniegšana var rezultēt ar konta bloķēšanu.
                                </span>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={isSubmitting}
                            >
                                Atgriezties
                            </button>
                            <button
                                onClick={submitVerification}
                                disabled={isSubmitting || !photos.selfie || !photos.idDocument || !termsAccepted}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Nosūta verifikāciju...
                                    </div>
                                ) : (
                                    'Iesniegt verifikācijai'
                                )}
                            </button>
                        </div>

                        {/* Expected Timeline */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium text-gray-900 mb-2">Ko gaidīt tālāk?</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                                <p>✅ Mēs pārbaudīsim tavus dokumentus 1-3 darba dienu laikā</p>
                                <p>📧 Saņemsi e-pasta paziņojumu par rezultātu</p>
                                <p>🏆 Pēc apstiprināšanas profilus būs redzama zilā atzīme</p>
                                <p>💬 Verificēti lietotāji iegūst papildu uzticamību kopienā</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => router.get('/dashboard')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Atgriezties uz sākumlapu
                    </button>
                </div>
            </div>
        </div>
    );
}
