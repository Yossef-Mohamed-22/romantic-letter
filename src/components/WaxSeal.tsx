import React from 'react';
import { motion } from 'framer-motion';

interface WaxSealProps {
  isBreaking?: boolean;
  onClick?: () => void;
  accentColor?: string;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  isBreaking = false,
  onClick,
  accentColor = '#D5B47A',
}) => {
  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer select-none z-30"
      initial={{ scale: 1, rotate: 0 }}
      animate={
        isBreaking
          ? {
              scale: [1, 1.25, 0],
              opacity: [1, 0.8, 0],
              rotate: [0, 15, -25],
              filter: ['blur(0px)', 'blur(2px)', 'blur(8px)'],
            }
          : {
              scale: [1, 1.03, 1],
            }
      }
      transition={
        isBreaking
          ? { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
          : { repeat: Infinity, duration: 4, ease: 'easeInOut' }
      }
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer molten wax drip silhouette */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full relative flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
        {/* Irregular wax stamp background */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, #F3E0BA 0%, #D5B47A 45%, #9E7934 85%, #6A4F1E 100%)',
            boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -4px 8px rgba(0,0,0,0.5), 0 6px 15px rgba(0,0,0,0.5)',
          }}
        />

        {/* Outer Wax Seal Ridge */}
        <div
          className="absolute inset-1.5 rounded-full border-2 border-[#E9D3A4]/60"
          style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(255,255,255,0.4)',
          }}
        />

        {/* Inner Depressed Center Circle */}
        <div
          className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle at 45% 45%, #C9A464 0%, #94712F 75%, #684B18 100%)',
            boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.6), 0 1px 2px rgba(255,255,255,0.4)',
          }}
        >
          {/* Embossed Heart Symbol */}
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 filter drop-shadow-[0_1.5px_1px_rgba(255,255,255,0.45)]"
            viewBox="0 0 24 24"
            fill="url(#heartGoldGradient)"
          >
            <defs>
              <linearGradient id="heartGoldGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF2D6" />
                <stop offset="50%" stopColor="#D5B47A" />
                <stop offset="100%" stopColor="#876527" />
              </linearGradient>
            </defs>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Molten wax organic bumps */}
        <div className="absolute -top-1 -right-0.5 w-3 h-3 rounded-full bg-[#B8924B] opacity-80" />
        <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#9E7934] opacity-80" />
        <div className="absolute top-2 -left-1.5 w-2.5 h-2.5 rounded-full bg-[#A8833E] opacity-75" />
      </div>
    </motion.div>
  );
};
