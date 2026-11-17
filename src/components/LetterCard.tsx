import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Image as ImageIcon } from 'lucide-react';
import { LaceBorder } from './LaceBorder.tsx';
import { Letter } from '../types/index.ts';

interface LetterCardProps {
  letter: Letter;
  onOpenMemories: () => void;
}

export const LetterCard: React.FC<LetterCardProps> = ({ letter, onOpenMemories }) => {
  const {
    recipient_name,
    title,
    message,
    closing_message,
    design_settings,
  } = letter;

  const paperBg = design_settings?.letterPaperColor || '#F2E3C3';
  const textColor = design_settings?.textColor || '#54232B';
  const goldColor = design_settings?.goldAccentColor || '#D5B47A';
  const fontFamilyClass =
    design_settings?.fontFamily === 'Noto Naskh Arabic'
      ? 'font-noto'
      : design_settings?.fontFamily === 'Aref Ruqaa'
      ? 'font-aref'
      : design_settings?.fontFamily === 'Reem Kufi'
      ? 'font-reem'
      : 'font-amiri';

  const textAlignClass =
    design_settings?.textAlign === 'right'
      ? 'text-right'
      : design_settings?.textAlign === 'left'
      ? 'text-left'
      : 'text-center';

  const fontSizeClass =
    design_settings?.fontSize === 'sm'
      ? 'text-xs sm:text-sm leading-relaxed'
      : design_settings?.fontSize === 'base'
      ? 'text-xs sm:text-base leading-relaxed'
      : design_settings?.fontSize === 'xl'
      ? 'text-sm sm:text-xl leading-relaxed'
      : 'text-xs sm:text-base md:text-lg leading-relaxed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl mx-auto flex items-center justify-center p-3 sm:p-6 my-auto z-20"
    >
      {/* Vintage Paper Container */}
      <div
        className="w-full relative rounded-2xl p-5 sm:p-9 md:p-11 shadow-letter overflow-hidden border border-[#D5B47A]/40 flex flex-col justify-between"
        style={{
          backgroundColor: paperBg,
          backgroundImage: `
            radial-gradient(circle at 50% 50%, #FFFDF9 0%, ${paperBg} 75%, #E5CE9F 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
          `,
        }}
      >
        {/* Intricate Lace Borders */}
        {design_settings?.showLaceBorder !== false && <LaceBorder color={goldColor} />}

        {/* Content Container - No scrollbar, balanced proportions */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Subtle Top Heart Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-1 sm:mb-2"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#590D19]/10 flex items-center justify-center border border-[#D5B47A]/30">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#941B2D] fill-[#941B2D]/80" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-aref text-xl sm:text-2xl md:text-3xl font-bold tracking-wide"
            style={{ color: textColor }}
          >
            {title || 'شخصي المفضل'}
          </motion.h2>

          {/* Recipient Name Accent */}
          {recipient_name && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-1.5 mb-2 px-4 sm:px-6 py-1 rounded-full bg-[#590D19]/10 border border-[#D5B47A]/50 shadow-sm flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#941B2D] fill-[#941B2D] animate-pulse" />
              <span
                className="font-aref text-base sm:text-xl md:text-2xl font-bold tracking-wide"
                style={{ color: '#941B2D' }}
              >
                إلى {recipient_name} ❤️
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#D5B47A]" />
            </motion.div>
          )}

          {/* Golden Divider Line */}
          <div
            className="w-20 sm:w-32 h-[1px] my-1 sm:my-2 rounded-full opacity-60"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${goldColor} 50%, transparent 100%)`,
            }}
          />

          {/* Main Romantic Letter Message (Compact line heights, balanced spacing) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className={`w-full my-1 sm:my-2 px-1 sm:px-3 ${fontFamilyClass} ${fontSizeClass} ${textAlignClass} font-normal whitespace-pre-line tracking-wide`}
            style={{ color: textColor }}
          >
            {message}
          </motion.div>

          {/* Closing Message & Heart Ornament */}
          {closing_message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="mt-1 mb-2.5 sm:mb-3 text-center font-aref text-xs sm:text-base font-semibold flex items-center justify-center gap-1.5"
              style={{ color: '#7E1727' }}
            >
              <span>{closing_message}</span>
            </motion.div>
          )}

          {/* Elegant Memories Button (الذكريات ❤️) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="w-full flex justify-center mt-1"
          >
            <motion.button
              onClick={onOpenMemories}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="group relative px-6 sm:px-8 py-2 sm:py-2.5 rounded-full font-aref text-base sm:text-lg font-bold shadow-md transition-all duration-300 flex items-center gap-2 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #7A1221 0%, #590D19 50%, #3B080F 100%)',
                color: '#F2E3C3',
                border: '1.5px solid rgba(213, 180, 122, 0.6)',
                boxShadow: '0 6px 20px rgba(89, 13, 25, 0.4)',
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D5B47A]/25 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform" />

              <ImageIcon className="w-4 h-4 text-[#D5B47A] group-hover:rotate-12 transition-transform" />
              <span>الذكريات</span>
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300 group-hover:scale-125 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
