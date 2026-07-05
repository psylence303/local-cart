/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, FileUp, Sparkles, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { compressImage } from '../utils/db';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapacitorCamera = async () => {
    setCameraError(null);
    setIsProcessing(true);
    try {
      // Triggers native Android Camera intent which handles requesting permissions and taking the photo natively
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      if (photo && photo.dataUrl) {
        const compressed = await compressImage(photo.dataUrl, 250, 0.75);
        onPhotoSelected(compressed);
        setCapturedImage(compressed);
      }
    } catch (err: any) {
      console.error('Error with Capacitor camera:', err);
      // Ignore user cancellation
      if (err.message && err.message.toLowerCase().includes('cancel')) {
        return;
      }
      setCameraError(err.message || 'Could not access native camera. Please grant permission in Android settings.');
    } finally {
      setIsProcessing(false);
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

  // Preset generator
  const handleSelectPreset = (emoji: string) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 120, 120);
        gradient.addColorStop(0, '#f0fdf4');
        gradient.addColorStop(1, '#ccfbf1');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 120, 120);

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
        {(currentPhotoUrl || capturedImage) && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setCapturedImage(null);
            }}
            className="text-xs text-red-500 font-medium hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
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
          onClick={() => setActiveTab('preset')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'preset' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Presets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('camera')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'camera' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          <CameraIcon className="w-3.5 h-3.5" />
          Camera
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            <span className="text-xs text-slate-600 font-medium">Processing photo...</span>
          </div>
        )}

        {/* Tab content: PRESET */}
        {activeTab === 'preset' && (
          <div className="p-3 w-full flex flex-col items-center">
            {currentPhotoUrl && !capturedImage ? (
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
                      className="aspect-square text-2xl hover:scale-115 active:scale-95 transition-transform flex items-center justify-center bg-white border border-slate-200 shadow-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
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
          <div className="w-full flex flex-col items-center p-4 relative gap-3">
            {capturedImage || currentPhotoUrl ? (
              <div className="flex flex-col items-center gap-2.5 py-2">
                <img
                  src={capturedImage || currentPhotoUrl}
                  alt="Captured photo"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-1 ring-slate-200"
                />
                <button
                  type="button"
                  onClick={handleCapacitorCamera}
                  className="text-xs text-teal-600 font-bold bg-teal-50 px-3.5 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <CameraIcon className="w-3.5 h-3.5" /> Retake Photo
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-3 py-2 items-center justify-center">
                <button
                  type="button"
                  onClick={handleCapacitorCamera}
                  className="w-full max-w-[240px] py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  <CameraIcon className="w-4.5 h-4.5" />
                  Take Photo with Phone Camera
                </button>
                {cameraError && (
                  <div className="p-2 text-center bg-red-50 border border-red-100 rounded-xl flex flex-col items-center gap-1">
                    <span className="text-[10px] text-red-700 font-semibold leading-normal px-2">
                      {cameraError}
                    </span>
                  </div>
                )}
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
                  className="text-xs text-slate-600 font-semibold bg-slate-200/80 px-3 py-1 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-all cursor-pointer"
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
                  className="mt-1 text-xs text-teal-600 font-bold bg-teal-50 border border-teal-200 px-3.5 py-1.5 rounded-lg hover:bg-teal-100 transition-all cursor-pointer"
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
