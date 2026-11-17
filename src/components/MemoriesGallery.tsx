import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight, Heart, Sparkles, Grid, Eye } from 'lucide-react';
import { Memory } from '../types/index.ts';

interface MemoriesGalleryProps {
  memories: Memory[];
  onBackToLetter: () => void;
  goldAccentColor?: string;
}

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({
  memories,
  onBackToLetter,
  goldAccentColor = '#D5B47A',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');

  // If no memories, fallback
  const validMemories = memories && memories.length > 0 ? memories : [];
  const currentMemory = validMemories[currentIndex] || {
    id: 'placeholder',
    image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000',
    caption: 'ذكرى خالدة في القلوب',
    display_order: 1,
  };

  const handleNext = () => {
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % validMemories.length);
  };

  const handlePrev = () => {
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + validMemories.length) % validMemories.length);
  };

  // Keyboard navigation support (RTL: ArrowRight = previous, ArrowLeft = next)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'single') return;
      if (e.key === 'ArrowRight') {
        handlePrev();
      } else if (e.key === 'ArrowLeft') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentIndex, validMemories.length]);

  // Rotations for natural scrapbook polaroid feeling (-4deg to +4deg)
  const scrapbookRotations = [-2.5, 3.2, -3.8, 1.8, -1.9, 3.6, -2.8, 2.4, -3.1];
  const activeRotation = scrapbookRotations[currentIndex % scrapbookRotations.length];

  // 3D Cinematic variants for floating transition
  const cardVariants = {
    enter: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? 240 : -240,
      y: 40,
      rotateZ: dir === 'next' ? 12 : -12,
      rotateX: 18,
      scale: 0.82,
      opacity: 0,
      filter: 'blur(4px)',
    }),
    center: {
      x: 0,
      y: 0,
      rotateZ: activeRotation,
      rotateX: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: 'next' | 'prev') => ({
      x: dir === 'next' ? -260 : 260,
      y: -60,
      rotateZ: dir === 'next' ? -18 : 18,
      rotateY: dir === 'next' ? -25 : 25,
      scale: 1.12,
      opacity: 0,
      filter: 'blur(6px)',
      transition: {
        duration: 0.75,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-between px-3 sm:px-6 py-6 sm:py-8 select-none z-20">
      {/* Top Bar: Back to letter & view switcher */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl flex items-center justify-between mb-2 z-30"
      >
        <button
          onClick={onBackToLetter}
          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#590D19]/60 hover:bg-[#590D19] border border-[#D5B47A]/40 text-[#F2E3C3] text-xs sm:text-base font-amiri flex items-center gap-1.5 backdrop-blur-md transition-all duration-300 shadow-md group"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D5B47A] group-hover:translate-x-0.5 transition-transform" />
          <span>العودة للرسالة</span>
        </button>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'single' ? 'grid' : 'single')}
            className="p-2 sm:p-2.5 rounded-full bg-[#590D19]/60 hover:bg-[#590D19] border border-[#D5B47A]/40 text-[#D5B47A] backdrop-blur-md transition-colors"
            title={viewMode === 'single' ? 'عرض كافة الذكريات الـ 9' : 'عرض البطاقة الفردية'}
          >
            {viewMode === 'single' ? <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {/* Counter pill */}
          <div className="px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[#230408]/70 border border-[#D5B47A]/30 text-xs sm:text-sm font-aref text-[#D5B47A] backdrop-blur-md">
            {currentIndex + 1} / {validMemories.length}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {viewMode === 'single' ? (
        <div className="relative w-full max-w-md sm:max-w-lg flex-1 flex flex-col items-center justify-center my-auto perspective-[1200px]">
          {/* Subtle scrapbook background tape/accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D5B47A]/5 blur-3xl rounded-full pointer-events-none" />

          {/* Floating Polaroid Card - Proportional on mobile */}
          <div className="relative w-[260px] sm:w-[330px] md:w-[360px] h-[350px] sm:h-[430px] md:h-[460px] flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentMemory.id || currentIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -100 || offset.x < -60) {
                    handleNext();
                  } else if (swipe > 100 || offset.x > 60) {
                    handlePrev();
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing rounded-xl p-3 sm:p-4 bg-[#F7EED9] shadow-polaroid border border-[#D5B47A]/50 flex flex-col justify-between"
                style={{
                  transformStyle: 'preserve-3d',
                  backgroundImage: `
                    linear-gradient(135deg, #FCF8EE 0%, #F5E8CB 100%),
                    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 80%)
                  `,
                }}
              >
                {/* Washi tape on top center */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 sm:h-7 rounded-sm opacity-80 pointer-events-none shadow-sm"
                  style={{
                    backgroundColor: '#E6D0A7',
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(89, 13, 25, 0.1) 4px, rgba(89, 13, 25, 0.1) 8px)',
                    border: '1px solid rgba(213, 180, 122, 0.4)',
                  }}
                />

                {/* Photo Image Frame with warm Skeleton placeholder */}
                <div className="relative w-full h-[225px] sm:h-[290px] md:h-[315px] rounded-lg overflow-hidden bg-[#EADBBE] shadow-inner border border-black/10 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none" />
                  <img
                    src={currentMemory.image_url}
                    alt={currentMemory.caption || 'ذكرى رومانسية'}
                    className="w-full h-full object-cover select-none pointer-events-none relative z-10 transition-opacity duration-500"
                    loading="eager"
                  />
                  {/* Subtle photographic vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none z-20" />
                </div>

                {/* Caption in handwritten Arabic font */}
                <div className="w-full py-1.5 sm:py-2.5 px-1 flex flex-col items-center justify-center text-center">
                  <p
                    className="font-aref text-sm sm:text-base md:text-lg font-bold tracking-wide line-clamp-2"
                    style={{ color: '#54232B' }}
                  >
                    {currentMemory.caption || 'أجمل اللحظات التي تجمعنا معاً ❤️'}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-[#941B2D]/70 font-amiri">
                    <Sparkles className="w-3 h-3 text-[#D5B47A]" />
                    <span>ذكرى لا تُنسى</span>
                    <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="w-full flex items-center justify-center gap-5 sm:gap-6 mt-3 sm:mt-6 z-30">
            <button
              onClick={handlePrev}
              aria-label="الذكرى السابقة"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#590D19]/80 hover:bg-[#781324] border border-[#D5B47A]/50 text-[#F2E3C3] flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#D5B47A]" />
            </button>

            {/* Thumbnail dots indicator */}
            <div className="flex items-center gap-1.5">
              {validMemories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentIndex ? 'next' : 'prev');
                    setCurrentIndex(i);
                  }}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-5 sm:w-6 bg-[#D5B47A]'
                      : 'w-2 sm:w-2.5 bg-[#D5B47A]/30 hover:bg-[#D5B47A]/60'
                  }`}
                  aria-label={`الانتقال إلى الذكرى ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="الذكرى التالية"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#590D19]/80 hover:bg-[#781324] border border-[#D5B47A]/50 text-[#F2E3C3] flex items-center justify-center shadow-lg transition-transform active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#D5B47A]" />
            </button>
          </div>
        </div>
      ) : (
        /* Full 9-Photo Scrapbook Grid View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 my-auto p-2 overflow-y-auto max-h-[75vh]"
        >
          {validMemories.map((mem, index) => {
            const rot = scrapbookRotations[index % scrapbookRotations.length];
            return (
              <motion.div
                key={mem.id || index}
                whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                onClick={() => {
                  setCurrentIndex(index);
                  setViewMode('single');
                }}
                className="cursor-pointer rounded-lg p-2.5 bg-[#F7EED9] shadow-polaroid border border-[#D5B47A]/40 transition-shadow duration-300 flex flex-col justify-between"
                style={{
                  transform: `rotate(${rot}deg)`,
                }}
              >
                <div className="w-full aspect-[4/3] rounded overflow-hidden bg-black/10">
                  <img
                    src={mem.image_url}
                    alt={mem.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-2 text-center">
                  <p className="font-aref text-xs sm:text-sm font-bold text-[#54232B] truncate">
                    {mem.caption || `ذكرى #${index + 1}`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Bottom Hint */}
      <div className="text-center text-xs text-[#F2E3C3]/50 font-amiri mt-2">
        يمكنك السحب باللمس أو النقر على الأسهم للتنقل بين ذكرياتنا ❤️
      </div>
    </div>
  );
};
