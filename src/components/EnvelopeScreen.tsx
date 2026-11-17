import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WaxSeal } from './WaxSeal.tsx';
import { DesignSettings } from '../types/index.ts';

interface EnvelopeScreenProps {
  letterId: string;
  designSettings: DesignSettings;
  onUnlockSuccess: (enteredName: string) => Promise<void>;
  isLoading?: boolean;
}

export const EnvelopeScreen: React.FC<EnvelopeScreenProps> = ({
  letterId,
  designSettings,
  onUnlockSuccess,
  isLoading = false,
}) => {
  const [enteredName, setEnteredName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOpenAnimationStarted, setIsOpenAnimationStarted] = useState(false);
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isLetterRising, setIsLetterRising] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredName.trim() || isVerifying || isOpenAnimationStarted) return;

    setErrorMsg('');
    setIsVerifying(true);

    try {
      await onUnlockSuccess(enteredName.trim());

      // Correct name! Trigger envelope opening sequence
      setIsOpenAnimationStarted(true);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([35, 50, 35]);
        } catch {
          // ignore if disabled
        }
      }

      // 1. Confetti burst
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D5B47A', '#F2E3C3', '#941B2D', '#FFCCD5', '#E6C68A'],
      });

      // 2. Open Flap after wax seal breaks
      setTimeout(() => {
        setIsFlapOpen(true);
      }, 700);

      // 3. Letter rises from inside envelope
      setTimeout(() => {
        setIsLetterRising(true);
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'هذه الرسالة كُتبت لأميرة أخرى.. تأكدي من كتابة اسمكِ بشكل صحيح ❤️');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setIsVerifying(false);
    }
  };

  const envelopeBg = designSettings?.envelopeColor || '#590D19';
  const goldColor = designSettings?.goldAccentColor || '#D5B47A';

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none">
      {/* Title "لك" above envelope */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center mb-2.5 sm:mb-6 z-10"
      >
        <h1
          className="font-aref text-5xl sm:text-7xl font-bold tracking-wider relative inline-block text-transparent bg-clip-text"
          style={{
            backgroundImage: `linear-gradient(135deg, #FFF5DD 0%, ${goldColor} 50%, #997434 100%)`,
            filter: 'drop-shadow(0 4px 12px rgba(213, 180, 122, 0.4))',
          }}
        >
          لَـكِ
        </h1>
        <p className="text-cream-200/80 text-xs sm:text-base font-amiri mt-0.5 tracking-wide">
          رسالة خاصة ومحفوفة بالسرية لك وحدك
        </p>
      </motion.div>

      {/* Envelope Container with realistic 3D perspective */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative w-full max-w-[310px] sm:max-w-[420px] md:max-w-[460px] h-[195px] sm:h-[265px] md:h-[290px] perspective-[1200px] z-10"
      >
        {/* Soft Ambient Floating Movement */}
        <motion.div
          animate={
            isOpenAnimationStarted
              ? { y: 30 }
              : { y: [0, -8, 0] }
          }
          transition={
            isOpenAnimationStarted
              ? { duration: 1 }
              : { repeat: Infinity, duration: 6, ease: 'easeInOut' }
          }
          className="w-full h-full relative"
        >
          {/* Envelope Main Body Card */}
          <div
            className="w-full h-full rounded-xl relative shadow-envelope overflow-hidden border border-[#D5B47A]/30"
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
                  initial={{ y: 0, scale: 0.88, opacity: 0.8 }}
                  animate={{
                    y: -150,
                    scale: 1.05,
                    opacity: 1,
                    transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className="absolute left-6 right-6 top-8 bottom-6 rounded-md shadow-2xl p-4 flex flex-col items-center justify-center pointer-events-none z-20 border border-[#D5B47A]/40"
                  style={{
                    backgroundColor: designSettings?.letterPaperColor || '#F2E3C3',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF0DA 0%, #F2E3C3 75%, #E2CCA1 100%)',
                  }}
                >
                  <div className="w-full h-full border border-[#D5B47A]/50 rounded p-2 flex flex-col items-center justify-center text-center">
                    <Sparkles className="w-5 h-5 text-[#941B2D] mb-1 animate-pulse" />
                    <span className="font-aref text-lg text-[#54232B] font-bold">شخصي المفضل</span>
                    <span className="text-xs text-[#54232B]/70 font-amiri mt-1">تُفتح بين يديك الآن...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Envelope Pocket Cutout Triangles (Left, Right, Bottom flaps) */}
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
                <filter id="foldShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="-3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Left Flap */}
              <polygon points="0,0 230,150 0,300" fill="url(#leftFold)" />

              {/* Right Flap */}
              <polygon points="460,0 230,150 460,300" fill="url(#rightFold)" />

              {/* Bottom Flap */}
              <polygon points="0,300 230,135 460,300" fill="url(#bottomFold)" filter="url(#foldShadow)" />
            </svg>
          </div>

          {/* Top Flap (Opens Upwards in 3D) */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-[155px] sm:h-[190px] md:h-[205px] origin-top z-30"
            style={{ transformStyle: 'preserve-3d' }}
            animate={
              isFlapOpen
                ? {
                    rotateX: 180,
                    zIndex: 10,
                    transition: { duration: 1.1, ease: [0.4, 0, 0.2, 1] },
                  }
                : { rotateX: 0 }
            }
          >
            {/* Top Flap SVG Triangle pointing down */}
            <svg
              className="w-full h-full filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]"
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

            {/* Wax Seal positioned at the flap tip */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2">
              <WaxSeal
                isBreaking={isOpenAnimationStarted}
                accentColor={goldColor}
                onClick={() => {
                  if (!isOpenAnimationStarted && enteredName) {
                    handleSubmit({ preventDefault: () => {} } as any);
                  }
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Recipient Name Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={
          isOpenAnimationStarted
            ? { opacity: 0, y: 40, pointerEvents: 'none' }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8 sm:mt-12 w-full max-w-[320px] sm:max-w-[380px] px-3 z-20"
      >
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <motion.div
            animate={shake ? { x: [-10, 10, -7, 7, -4, 4, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            {/* Fully Integrated Responsive Flex Pill Bar - Icons NEVER overflow */}
            <div className="w-full flex items-center rounded-full bg-[#230408]/90 border border-[#D5B47A]/50 focus-within:border-[#D5B47A] focus-within:ring-2 focus-within:ring-[#D5B47A]/30 shadow-lg backdrop-blur-md p-1 pl-1.5 pr-3.5 transition-all duration-300">
              
              {/* Heart icon safely bound inside flex */}
              <div className="flex-shrink-0 text-[#D5B47A]/75 flex items-center justify-center pointer-events-none">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#D5B47A]/25" />
              </div>

              {/* Input is fluid, takes remaining space and never pushes icons out */}
              <input
                type="text"
                value={enteredName}
                onChange={(e) => {
                  setEnteredName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={isVerifying || isOpenAnimationStarted}
                placeholder="اسمكِ الجميل ❤️"
                dir="rtl"
                className="w-full flex-1 min-w-0 bg-transparent text-[#F2E3C3] placeholder-[#F2E3C3]/50 text-center font-amiri text-base sm:text-lg focus:outline-none px-2"
              />

              {/* Circular Submit Button safely bound inside flex */}
              <button
                type="submit"
                disabled={isVerifying || !enteredName.trim() || isOpenAnimationStarted}
                aria-label="فتح الرسالة"
                className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md group disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #EAD1A0 0%, #D5B47A 50%, #997434 100%)',
                }}
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-[#54232B] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#54232B] group-hover:-translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Animated Error Message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-3 px-4 py-1.5 rounded-full bg-red-950/70 border border-red-500/30 text-rose-200 text-xs sm:text-sm font-amiri text-center flex items-center gap-1.5 backdrop-blur-sm"
              >
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-3.5 text-xs text-[#F2E3C3]/80 font-amiri text-center">
            اكتبي اسمكِ لتُفتح لكِ رسالة كُتبت لأجلكِ وحدكِ ❤️
          </p>
        </form>
      </motion.div>
    </div>
  );
};
