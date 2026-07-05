/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, FileUp, Sparkles, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { compressImage } from '../utils/db';

interface CameraCaptureProps {
  onPhotoSelected: (base64Data: string) => void;
  currentPhotoUrl?: string;
  onClear: () => void;
}

const PRESET_EMOJIS = [
  { char: '🍎', name: 'Apple' },
  { char: '🥑', name: 'Avocado' },
  { char: '🥛', name: 'Milk' },
  { char: '🍞', name: 'Bread' },
  { char: '🥩', name: 'Steak' },
  { char: '🥫', name: 'Pantry' },
  { char: '🍪', name: 'Cookies' },
  { char: '🥤', name: 'Soda' },
  { char: '🧀', name: 'Cheese' },
  { char: '🥚', name: 'Eggs' },
  { char: '🧼', name: 'Soap' },
  { char: '🧴', name: 'Lotion' },
];

export default function CameraCapture({ onPhotoSelected, currentPhotoUrl, onClear }: CameraCaptureProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'preset'>('preset');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const startCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraError('Could not access camera. Please ensure camera permissions are granted. If you are using the AI Studio preview, you may need to open the app in a new tab.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleTabChange = (tab: 'camera' | 'upload' | 'preset') => {
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraStream) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const rawBase64 = canvas.toDataURL('image/jpeg', 0.85);
          
          setIsProcessing(true);
          compressImage(rawBase64, 250, 0.7)
            .then(compressed => {
              setCapturedImage(compressed);
              onPhotoSelected(compressed);
              stopCamera();
            })
            .catch(err => {
              console.error('Compression failed:', err);
              setCapturedImage(rawBase64);
              onPhotoSelected(rawBase64);
            })
            .finally(() => {
              setIsProcessing(false);
            });
        }
      } catch (err) {
        console.error('Failed to capture from video:', err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file, 250, 0.75);
      onPhotoSelected(compressed);
      setCapturedImage(compressed);
    } catch (err) {
      console.error('Error loading file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Turn emoji into a high quality avatar / vector image
  const handleSelectPreset = (emoji: string) => {
    try {
      // Draw emoji onto canvas to create a custom beautifully colored icon
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 120, 120);
        gradient.addColorStop(0, '#f0fdf4'); // Soft teal
        gradient.addColorStop(1, '#ccfbf1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 120, 120);

        // Render emoji centered
        ctx.font = '72px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 60, 60);

        const dataUrl = canvas.toDataURL('image/png');
        onPhotoSelected(dataUrl);
      }
    } catch (err) {
      console.error('Failed drawing preset:', err);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-800 text-sm font-semibold flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-slate-500" />
          Add Photo (Optional)
        </span>
        {currentPhotoUrl && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setCapturedImage(null);
              stopCamera();
            }}
            className="text-xs text-red-500 font-medium hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Remove Photo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => handleTabChange('preset')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Presets
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('camera')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'camera' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Camera
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('upload')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <FileUp className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      {/* Preview / Action Area */}
      <div className="relative bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center min-h-[140px] border border-dashed border-slate-300 transition-all">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/85 z-20 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
            <span className="text-xs text-slate-600 font-medium">Compressing photo...</span>
          </div>
        )}

        {/* Tab content: PRESET */}
        {activeTab === 'preset' && (
          <div className="p-3 w-full flex flex-col items-center">
            {currentPhotoUrl ? (
              <div className="flex flex-col items-center gap-2.5 py-1">
                <img
                  src={currentPhotoUrl}
                  alt="Preset preview"
                  referrerPolicy="no-referrer"
                  className="w-18 h-18 rounded-xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                />
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Selected
                </span>
              </div>
            ) : (
              <div className="w-full">
                <span className="text-[10px] text-slate-500 block text-center font-medium mb-2">
                  Select a food preset for quick illustration:
                </span>
                <div className="grid grid-cols-6 gap-2 px-1">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji.name}
                      type="button"
                      onClick={() => handleSelectPreset(emoji.char)}
                      className="aspect-square text-2xl hover:scale-115 active:scale-95 transition-transform flex items-center justify-center bg-white border border-slate-200 shadow-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                      title={emoji.name}
                    >
                      {emoji.char}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab content: CAMERA */}
        {activeTab === 'camera' && (
          <div className="w-full flex flex-col items-center p-2 relative">
            {cameraError ? (
              <div className="p-4 text-center text-slate-500 flex flex-col items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700">{cameraError}</span>
                <button
                  type="button"
                  onClick={startCamera}
                  className="mt-1 text-xs text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-lg hover:bg-teal-100 transition-all"
                >
                  Retry Camera
                </button>
              </div>
            ) : capturedImage || currentPhotoUrl ? (
              <div className="flex flex-col items-center gap-2.5 py-2">
                <img
                  src={capturedImage || currentPhotoUrl}
                  alt="Captured photo"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                />
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs text-slate-600 font-semibold bg-slate-200/80 px-3 py-1 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Take New
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center relative">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-36 rounded-xl object-cover bg-black"
                />
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 active:scale-90 transition-all shadow-md z-10 border-2 border-white"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab content: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="p-4 text-center w-full flex flex-col items-center justify-center">
            {currentPhotoUrl ? (
              <div className="flex flex-col items-center gap-2.5">
                <img
                  src={currentPhotoUrl}
                  alt="Uploaded photo"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-600 font-semibold bg-slate-200/80 px-3 py-1 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-all"
                >
                  <FileUp className="w-3 h-3" /> Change File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileUp className="w-8 h-8 text-slate-400" />
                <span className="text-xs text-slate-600 font-medium">JPEG or PNG file</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-xs text-teal-600 font-bold bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-lg hover:bg-teal-100 transition-all"
                >
                  Choose Image File
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
