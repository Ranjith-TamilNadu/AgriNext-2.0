
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { detectPestOrDisease } from '../services/geminiService';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CameraIcon } from './icons/CameraIcon';

const PestDetector: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            setAnalysis('');
            setError('');
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile) {
            setError('Please select an image first.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysis('');
        try {
            const base64Image = image?.split(',')[1];
            if (!base64Image) {
                throw new Error("Could not read image data.");
            }
            const result = await detectPestOrDisease(base64Image, imageFile.type);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to analyze image. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [image, imageFile]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    }, []);

    const handleOpenCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                setIsCameraOpen(true);
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setError("Could not access the camera. Please check permissions.");
                console.error(err);
            }
        } else {
            setError("Your browser does not support camera access.");
        }
    };

    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setImage(dataUrl);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                        setImageFile(file);
                    }
                }, 'image/jpeg');
            }
            stopCamera();
            setAnalysis('');
            setError('');
        }
    }, [stopCamera]);
    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-surface rounded-xl shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 h-80">
                        {isCameraOpen ? (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-black rounded-lg overflow-hidden">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                             </div>
                        ) : image ? (
                            <img src={image} alt="Plant preview" className="max-h-full max-w-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-text-secondary">
                                <svg xmlns="http://www.w.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="mt-2">Image preview will appear here</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text-primary">Get Plant Analysis</h3>
                        <p className="text-sm text-text-secondary">Upload a file or use your camera to take a photo of the affected plant.</p>
                        
                        {isCameraOpen ? (
                             <div className="flex justify-center space-x-4">
                                <button onClick={handleCapture} className="flex-1 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark">Capture</button>
                                <button onClick={stopCamera} className="flex-1 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700">Cancel</button>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={handleUploadClick}
                                        className="w-full bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 border border-slate-300"
                                    >
                                        Upload Image
                                    </button>
                                    <button
                                        onClick={handleOpenCamera}
                                        className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 flex items-center justify-center"
                                    >
                                        <CameraIcon className="w-5 h-5 mr-2" />
                                        Take Photo
                                    </button>
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={loading || !image}
                                    className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark disabled:bg-slate-400 flex items-center justify-center"
                                >
                                    {loading && <SpinnerIcon />}
                                    {loading ? 'Analyzing...' : 'Analyze Image'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {error && <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}

            {analysis && (
                <div className="mt-6 bg-surface rounded-xl shadow-md p-6">
                    <h3 className="text-xl font-bold text-text-primary mb-4">AI Analysis Result</h3>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis }}></div>
                </div>
            )}
        </div>
    );
};

export default PestDetector;