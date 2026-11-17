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
} from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageUrl: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
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
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imageRef = useRef<HTMLImageElement | null>(null);

  // Box dimensions in DOM (standardized across viewports)
  const boxWidth = aspectRatio === '1:1' ? 300 : aspectRatio === '4:5' ? 260 : 340;
  const boxHeight = aspectRatio === '1:1' ? 300 : aspectRatio === '4:5' ? 325 : 255;

  // Reset state when modal opens or image changes
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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  // Mouse & Touch Drag Pan Handling
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
    setOffset({ x: 0, y: 0 });
  };

  // Calculate Base Dimensions to ALWAYS Cover the Crop Box (Zero Black Bars!)
  const isRotated90 = rotation % 180 !== 0;
  const effectiveNatW = isRotated90 ? naturalSize.height : naturalSize.width;
  const effectiveNatH = isRotated90 ? naturalSize.width : naturalSize.height;

  const scaleToCover =
    effectiveNatW > 0 && effectiveNatH > 0
      ? Math.max(boxWidth / effectiveNatW, boxHeight / effectiveNatH)
      : 1;

  const baseWidth = naturalSize.width * scaleToCover;
  const baseHeight = naturalSize.height * scaleToCover;

  // Apply High-Resolution Crop strictly matching the visual viewport
  const handleApplyCrop = useCallback(() => {
    if (!imageRef.current || naturalSize.width === 0 || naturalSize.height === 0) return;
    setIsProcessing(true);

    const img = imageRef.current;

    // Target output resolution
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Scale factor from DOM crop box to output canvas
    const canvasScale = outputWidth / boxWidth;

    // Center of image in DOM space including drag offset
    const centerDomX = boxWidth / 2 + offset.x;
    const centerDomY = boxHeight / 2 + offset.y;

    // 1. Move canvas origin to the user's dragged center in output canvas coordinates
    ctx.translate(centerDomX * canvasScale, centerDomY * canvasScale);

    // 2. Apply user rotation around image center (exactly matching CSS transform)
    ctx.rotate((rotation * Math.PI) / 180);

    // 3. Apply zoom & canvas scale mapping
    ctx.scale(zoom * canvasScale, zoom * canvasScale);

    // 4. Draw image centered around (0, 0) - Fills the entire frame seamlessly!
    ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);

    // Export crisp, high-quality JPEG (zero black bars!)
    try {
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
      onCropComplete(croppedUrl);
      onClose();
    } catch (err) {
      console.error('Crop export failed:', err);
      alert('تعذر استخراج الصورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  }, [
    aspectRatio,
    boxWidth,
    boxHeight,
    zoom,
    rotation,
    offset,
    naturalSize,
    baseWidth,
    baseHeight,
    onCropComplete,
    onClose,
  ]);

  if (!isOpen) return null;

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
              <span>قص وتعديل الصورة (ملء كامل بدون أي حواف سوداء)</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-cream-200/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1F0307] border-b border-[#D5B47A]/15 text-xs">
            <span className="text-cream-200/70 ml-2">نسبة القص:</span>
            <button
              type="button"
              onClick={() => {
                setAspectRatio('1:1');
                setOffset({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                aspectRatio === '1:1'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              1:1 مربع (الأفضل للبولارويد)
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectRatio('4:5');
                setOffset({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                aspectRatio === '4:5'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              4:5 طولي أنيق
            </button>
            <button
              type="button"
              onClick={() => {
                setAspectRatio('4:3');
                setOffset({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                aspectRatio === '4:3'
                  ? 'bg-[#D5B47A] text-[#3B080F] shadow-sm'
                  : 'bg-[#3B080F] text-[#F2E3C3]/80 hover:bg-[#590D19]'
              }`}
            >
              4:3 مستطيل
            </button>
          </div>

          {/* Interactive Workspace Canvas */}
          <div className="relative w-full h-[330px] sm:h-[380px] bg-black/80 flex items-center justify-center overflow-hidden select-none">
            {/* The Crop Target Frame Box */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}
              className="relative rounded-lg overflow-hidden border-2 border-[#D5B47A] shadow-[0_0_0_9999px_rgba(0,0,0,0.75)] cursor-move z-10 flex items-center justify-center"
            >
              {/* Rule-of-thirds grid guidelines */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 opacity-30">
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div className="border-r border-b border-[#F2E3C3]" />
                <div />
              </div>

              {/* The movable / scalable / rotatable image positioned to ALWAYS cover */}
              {imageLoaded && (
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="قص الصورة"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  draggable={false}
                  style={{
                    width: `${baseWidth}px`,
                    height: `${baseHeight}px`,
                    position: 'absolute',
                    left: `${(boxWidth - baseWidth) / 2 + offset.x}px`,
                    top: `${(boxHeight - baseHeight) / 2 + offset.y}px`,
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.12s ease-out',
                  }}
                  className="max-w-none pointer-events-none select-none will-change-transform"
                />
              )}

              {/* Hidden image element to trigger initial load */}
              {!imageLoaded && (
                <img
                  src={imageUrl}
                  alt="تحميل"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  className="hidden"
                />
              )}
            </div>

            {/* Helper drag notice badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-[#D5B47A]/40 text-[11px] text-[#F2E3C3] backdrop-blur-sm pointer-events-none">
              <Move className="w-3.5 h-3.5 text-[#D5B47A]" />
              <span>اسحب الصورة لتحريكها داخل الإطار الذهبي</span>
            </div>
          </div>

          {/* Image Manipulation Controls Toolbar */}
          <div className="p-4 bg-[#230408] border-t border-[#D5B47A]/20 flex flex-col gap-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.15))}
                className="p-1.5 rounded-lg bg-[#3B080F] text-[#D5B47A] hover:bg-[#590D19] cursor-pointer"
                title="تصغير"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#D5B47A] bg-[#3B080F] h-1.5 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.15))}
                className="p-1.5 rounded-lg bg-[#3B080F] text-[#D5B47A] hover:bg-[#590D19] cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl bg-[#3B080F] hover:bg-[#590D19] border border-[#D5B47A]/30 text-xs text-[#F2E3C3] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="تدوير 90 درجة"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#D5B47A]" />
                  <span>تدوير</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-[#3B080F] hover:bg-[#590D19] border border-[#D5B47A]/30 text-xs text-[#F2E3C3] flex items-center gap-1.5 transition-colors cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-white/5 text-xs text-cream-200/70 hover:text-white transition-colors cursor-pointer"
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
                      <span>قص وتطبيق الصورة</span>
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
