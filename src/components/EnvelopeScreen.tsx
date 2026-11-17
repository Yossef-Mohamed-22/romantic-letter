import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaxSeal } from './WaxSeal.tsx';
import { DesignSettings } from '../types/index.ts';

interface EnvelopeScreenProps {
  letterId: string;
  designSettings: DesignSettings;
  onUnlockSuccess: () => Promise<void>;
  isLoading?: boolean;
}

export const EnvelopeScreen: React.FC<EnvelopeScreenProps> = ({
  letterId,
  designSettings,
  onUnlockSuccess,
  isLoading = false,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpenAnimationStarted, setIsOpenAnimationStarted] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isLetterRising, setIsLetterRising] = useState(false);

  const handleOpenEnvelope = async () => {
    if (isOpening || isOpenAnimationStarted) return;
    setIsOpening(true);

    try {
      // 1. Trigger open animation immediately with zero delay
      setIsOpenAnimationStarted(true);

      // Lightweight confetti burst (optimized for 60fps)
      try {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D5B47A', '#F2E3C3', '#941B2D', '#FFCCD5', '#E6C68A'],
          disableForReducedMotion: true,
          ticks: 160,
        });
      } catch {}

      // 2. Open 3D flap quickly (after seal begins breaking at 150ms)
      setTimeout(() => {
        setIsFlapOpen(true);
      }, 150);

      // 3. Letter card emerges smoothly at 450ms
      setTimeout(() => {
        setIsLetterRising(true);
      }, 450);

      // Trigger callback to fetch/unlock letter data in parallel
      await onUnlockSuccess();
    } catch (err: any) {
      console.error('Failed to open envelope:', err);
    } finally {
      setIsOpening(false);
    }
  };

  const envelopeBg = designSettings?.envelopeColor || '#590D19';
  const goldColor = designSettings?.goldAccentColor || '#D5B47A';

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none overflow-hidden">
      {/* Title "لكِ" above envelope */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-4 sm:mb-6 z-10"
      >
        <h1
          className="font-aref text-5xl sm:text-7xl font-bold tracking-wider relative inline-block text-transparent bg-clip-text"
          style={{
            backgroundImage: `linear-gradient(135deg, #FFF5DD 0%, ${goldColor} 50%, #997434 100%)`,
            filter: 'drop-shadow(0 3px 10px rgba(213, 180, 122, 0.35))',
          }}
        >
          لَـكِ
        </h1>
        <p className="text-cream-200/80 text-xs sm:text-base font-amiri mt-1 tracking-wide">
          رسالة خاصة ومحفوفة بالحب كُتبت لأجلكِ وحدكِ
        </p>
      </motion.div>

      {/* Envelope Container with realistic 3D perspective - GPU Accelerated */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={!isOpenAnimationStarted ? { scale: 1.02 } : {}}
        whileTap={!isOpenAnimationStarted ? { scale: 0.98 } : {}}
        onClick={!isOpenAnimationStarted ? handleOpenEnvelope : undefined}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-[310px] sm:max-w-[420px] md:max-w-[460px] h-[195px] sm:h-[265px] md:h-[290px] perspective-[1200px] z-10 transform-gpu ${
          !isOpenAnimationStarted ? 'cursor-pointer' : ''
        }`}
        title="اضغطي لفتح الرسالة"
      >
        {/* Soft Ambient Floating Movement */}
        <motion.div
          animate={
            isOpenAnimationStarted
              ? { y: 20 }
              : { y: [0, -6, 0] }
          }
          transition={
            isOpenAnimationStarted
              ? { duration: 0.6 }
              : { repeat: Infinity, duration: 5, ease: 'easeInOut' }
          }
          className="w-full h-full relative transform-gpu"
        >
          {/* Envelope Main Body Card */}
          <div
            className="w-full h-full rounded-xl relative shadow-2xl overflow-hidden border border-[#D5B47A]/30 transition-shadow duration-300"
            style={{
              backgroundColor: envelopeBg,
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 80%),
                linear-gradient(145deg, #6A101E 0%, ${envelopeBg} 60%, #3B080F 100%)
              `,
            }}
          >
            {/* Subtle vintage gold border outline on envelope body */}
            <div className="absolute inset-2.5 rounded-lg border border-[#D5B47A]/20 pointer-events-none" />

            {/* Inside Envelope Pocket Darkening */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent pointer-events-none" />

            {/* Emerging Letter Card from inside pocket */}
            <AnimatePresence>
              {isLetterRising && (
                <motion.div
                  initial={{ y: 0, scale: 0.9, opacity: 0.9 }}
                  animate={{
                    y: -140,
                    scale: 1.04,
                    opacity: 1,
                    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="absolute left-6 right-6 top-8 bottom-6 rounded-md shadow-2xl p-4 flex flex-col items-center justify-center pointer-events-none z-20 border border-[#D5B47A]/40 transform-gpu will-change-transform"
                  style={{
                    backgroundColor: designSettings?.letterPaperColor || '#F2E3C3',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF0DA 0%, #F2E3C3 75%, #E2CCA1 100%)',
                  }}
                >
                  <div className="w-full h-full border border-[#D5B47A]/50 rounded p-2 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-5 h-5 text-[#941B2D] mb-1 animate-pulse" />
                    <span className="font-aref text-lg text-[#54232B] font-bold">شخصي المفضل</span>
                    <span className="text-xs text-[#54232B]/70 font-amiri mt-1">تُفتح بين يديكِ الآن...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Envelope Pocket Cutout Triangles (Clean CSS/SVG without heavy filters) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              viewBox="0 0 460 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="leftFold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6C1220" />
                  <stop offset="100%" stopColor="#410810" />
                </linearGradient>
                <linearGradient id="rightFold" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C1220" />
                  <stop offset="100%" stopColor="#410810" />
                </linearGradient>
                <linearGradient id="bottomFold" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#4F0913" />
                  <stop offset="100%" stopColor="#781424" />
                </linearGradient>
              </defs>

              {/* Left Flap */}
              <polygon points="0,0 230,150 0,300" fill="url(#leftFold)" />

              {/* Right Flap */}
              <polygon points="460,0 230,150 460,300" fill="url(#rightFold)" />

              {/* Bottom Flap */}
              <polygon points="0,300 230,135 460,300" fill="url(#bottomFold)" />
            </svg>
          </div>

          {/* Top Flap (Opens Upwards in 3D) - Optimized with GPU transform and backface hidden */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[155px] sm:h-[190px] md:h-[205px] origin-top z-30 transform-gpu will-change-transform"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
            }}
            animate={
              isFlapOpen
                ? {
                    rotateX: 180,
                    zIndex: 10,
                    transition: { duration: 0.65, ease: [0.25, 1, 0.5, 1] },
                  }
                : { rotateX: 0 }
            }
          >
            {/* Top Flap SVG Triangle pointing down */}
            <svg
              className="w-full h-full drop-shadow-md"
              viewBox="0 0 460 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="topFlapGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7E1727" />
                  <stop offset="65%" stopColor="#590D19" />
                  <stop offset="100%" stopColor="#430811" />
                </linearGradient>
              </defs>
              <polygon points="0,0 460,0 230,195" fill="url(#topFlapGrad)" />
              {/* Delicate Gold Rim along the flap edge */}
              <line x1="0" y1="0" x2="230" y2="195" stroke="#D5B47A" strokeWidth="1.5" strokeOpacity="0.45" />
              <line x1="460" y1="0" x2="230" y2="195" stroke="#D5B47A" strokeWidth="1.5" strokeOpacity="0.45" />
            </svg>

            {/* Wax Seal positioned at the flap tip - Clickable */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 cursor-pointer z-40">
              <WaxSeal
                isBreaking={isOpenAnimationStarted}
                accentColor={goldColor}
                onClick={handleOpenEnvelope}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Tap to Open Action Button & Romantic Instruction */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={
          isOpenAnimationStarted
            ? { opacity: 0, y: 25, pointerEvents: 'none' }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.4 }}
        className="mt-8 sm:mt-11 z-20 flex flex-col items-center gap-3 w-full max-w-sm px-4"
      >
        <button
          onClick={handleOpenEnvelope}
          disabled={isOpening || isOpenAnimationStarted}
          className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full border border-[#D5B47A]/70 shadow-[0_4px_20px_rgba(213,180,122,0.25)] hover:shadow-[0_4px_30px_rgba(213,180,122,0.45)] hover:border-[#D5B47A] active:scale-95 transition-all duration-300 backdrop-blur-md cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #781324 0%, #590D19 50%, #3B080F 100%)',
          }}
        >
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse group-hover:scale-125 transition-transform" />
          <span className="font-aref text-xl sm:text-2xl text-[#F2E3C3] font-bold tracking-wide">
            اضغطي لفتح الرسالة ❤️
          </span>
          <Sparkles className="w-5 h-5 text-[#D5B47A] group-hover:rotate-45 transition-transform" />
        </button>

        <p className="text-xs sm:text-sm text-[#F2E3C3]/80 font-amiri text-center tracking-wide">
          المسي المظروف أو الختم الذهبي لتُفتح لكِ الرسالة 💌
        </p>
      </motion.div>
    </div>
  );
};
