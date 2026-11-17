import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  X,
  Crop,
  Move,
  Sparkles,
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
  aspectRatioLabel?: string;
}

type AspectRatio = '1:1' | '4:5' | '4:3';

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  onCropComplete,
  onClose,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset state when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
      setIsProcessing(false);
    }
  }, [isOpen, imageUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Perform High-Resolution Off-screen Crop
  const handleApplyCrop = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    setIsProcessing(true);

    const img = imageRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Determine target output resolution
    const outputWidth = 800;
    const outputHeight =
      aspectRatio === '1:1' ? 800 : aspectRatio === '4:5' ? 1000 : 600;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // High quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Fill background with warm vintage tone
    ctx.fillStyle = '#1D0306';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // Calculate crop coordinates
    ctx.save();
    ctx.translate(outputWidth / 2, outputHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Scale mapping from container viewport to canvas
    const scaleRatio = outputWidth / rect.width;
    const finalScale = zoom * scaleRatio;

    ctx.translate(offset.x * scaleRatio, offset.y * scaleRatio);

    // Draw image centered
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW = outputWidth;
    let drawH = outputWidth / imgAspect;

    if (drawH < outputHeight) {
      drawH = outputHeight;
      drawW = outputHeight * imgAspect;
    }

    drawW *= zoom;
    drawH *= zoom;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Export optimized WebP/JPEG
    try {
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.88);
      onCropComplete(croppedUrl);
      onClose();
    } catch (err) {
      console.error('Crop export failed:', err);
      alert('تعذر قص الصورة، تأكد من أن الرابط يسمح بالتعديل.');
    } finally {
      setIsProcessing(false);
    }
  }, [aspectRatio, zoom, rotation, offset, onCropComplete, onClose]);

  if (!isOpen) return null;

  // Aspect ratio dimensions for preview frame
  const cropBoxAspectStyle =
    aspectRatio === '1:1'
      ? 'w-[260px] h-[260px] sm:w-[320px] sm:h-[320px]'
      : aspectRatio === '4:5'
      ? 'w-[240px] h-[300px] sm:w-[280px] sm:h-[350px]'
      : 'w-[280px] h-[210px] sm:w-[360px] sm:h-[270px]';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg bg-[#2E050B] border border-[#D5B47A]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D5B47A]/25 bg-[#230408]">
            <div className="flex items-center gap-2 text-[#D5B47A] font-aref text-lg font-bold">
              <Crop className="w-5 h-5 text-[#D5B47A]" />
              <span>تعديل وقص صورة الذكرى</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-cream-200/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F0307] border-b border-[#D5B47A]/15 text-xs">
            <span className="text-cream-200/70 ml-2">نسبة القص:</span>
            <button
              type="button"
              onClick={() => setAspectRatio('1:1')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                aspectRatio === '1:1'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              1:1 مربع (بولارويد)
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('4:5')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                aspectRatio === '4:5'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              4:5 طولي
            </button>
            <button
              type="button"
              onClick={() => setAspectRatio('4:3')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                aspectRatio === '4:3'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              4:3 مستطيل
            </button>
          </div>

          {/* Interactive Workspace Canvas */}
          <div className="relative w-full h-[320px] sm:h-[380px] bg-black/70 flex items-center justify-center overflow-hidden select-none">
            {/* The Crop Target Frame Box */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative ${cropBoxAspectStyle} rounded-lg overflow-hidden border-2 border-[#D5B47A] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] cursor-move z-10 flex items-center justify-center`}
            >
              {/* Rule-of-thirds grid guidelines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 opacity-30">
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-b border-[#F2E3C3]" />
                <div className="border-r border-[#F2E3C3]" />
                <div className="border-r border-[#F2E3C3]" />
                <div />
              </div>

              {/* The movable / scalable / rotatable image */}
              <img
                ref={imageRef}
                src={imageUrl}
                alt="قص الصورة"
                crossOrigin="anonymous"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                className="max-w-none pointer-events-none select-none transition-transform will-change-transform"
              />
            </div>

            {/* Helper drag notice badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-[#D5B47A]/30 text-[11px] text-[#F2E3C3] backdrop-blur-sm pointer-events-none">
              <Move className="w-3.5 h-3.5 text-[#D5B47A]" />
              <span>اسحب الصورة لتحريكها وضبط موضعها</span>
            </div>
          </div>

          {/* Image Manipulation Controls Toolbar */}
          <div className="p-4 bg-[#230408] border-t border-[#D5B47A]/20 flex flex-col gap-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
                className="p-1.5 rounded-lg bg-[#3B080F] text-[#D5B47A] hover:bg-[#590D19]"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#D5B47A] bg-[#3B080F] h-1.5 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                className="p-1.5 rounded-lg bg-[#3B080F] text-[#D5B47A] hover:bg-[#590D19]"
                title="تكبير"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-cream-200/80 min-w-[40px] text-left">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Secondary actions & submit */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-3 py-1.5 rounded-xl bg-[#3B080F] hover:bg-[#590D19] border border-[#D5B47A]/30 text-xs text-[#F2E3C3] flex items-center gap-1.5 transition-colors"
                  title="تدوير 90 درجة"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#D5B47A]" />
                  <span>تدوير</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-[#3B080F] hover:bg-[#590D19] border border-[#D5B47A]/30 text-xs text-[#F2E3C3] flex items-center gap-1.5 transition-colors"
                  title="إعادة تعيين الموضع"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#D5B47A]" />
                  <span>إعادة ضبط</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-xs text-cream-200/70 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!imageLoaded || isProcessing}
                  onClick={handleApplyCrop}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D5B47A] to-[#B8924B] text-[#3B080F] font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-[#3B080F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#3B080F]" />
                      <span>قص وحفظ الصورة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
