import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock } from 'lucide-react';
import { AmbientBackground } from './components/AmbientBackground.tsx';
import { EnvelopeScreen } from './components/EnvelopeScreen.tsx';
import { LetterCard } from './components/LetterCard.tsx';
import { MemoriesGallery } from './components/MemoriesGallery.tsx';
import { MusicPlayer } from './components/MusicPlayer.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AdminLogin } from './components/AdminLogin.tsx';
import { api } from './services/api.ts';
import { Letter, LetterPublicMetadata, DesignSettings } from './types/index.ts';

const DEFAULT_LETTER_ID = 'secret-love-letter';

export const App: React.FC = () => {
  // Extract letter ID from URL query param e.g. ?letter=123
  const getLetterIdFromUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get('letter') || DEFAULT_LETTER_ID;
  };

  const [letterId, setLetterId] = useState<string>(getLetterIdFromUrl());
  const [view, setView] = useState<'envelope' | 'letter' | 'memories' | 'admin'>('envelope');
  const [publicData, setPublicData] = useState<LetterPublicMetadata | null>(null);
  const [unlockedLetter, setUnlockedLetter] = useState<Letter | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('romantic_admin_token'));
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoadingPublicData, setIsLoadingPublicData] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  // Design fallback
  const currentDesign: DesignSettings =
    unlockedLetter?.design_settings ||
    publicData?.design_settings || {
      backgroundColor: '#3B080F',
      envelopeColor: '#590D19',
      letterPaperColor: '#F2E3C3',
      textColor: '#54232B',
      goldAccentColor: '#D5B47A',
      fontFamily: 'Amiri',
      fontSize: 'lg',
      textAlign: 'center',
      showParticles: true,
      showLaceBorder: true,
    };

  // Check if URL has ?admin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      if (authToken) {
        setView('admin');
      } else {
        setShowLoginModal(true);
      }
    }
  }, [authToken]);

  // Fetch public envelope info
  useEffect(() => {
    const fetchPublicInfo = async () => {
      setIsLoadingPublicData(true);
      setLoadError('');
      try {
        const data = await api.getPublicLetter(letterId);
        setPublicData(data);
      } catch (err: any) {
        console.error('Failed to load letter public data:', err);
        setLoadError(err.message || 'فشل في تحميل الرسالة');
      } finally {
        setIsLoadingPublicData(false);
      }
    };

    fetchPublicInfo();
  }, [letterId]);

  // Handle Unlocking
  const handleUnlock = async (password: string): Promise<void> => {
    const letter = await api.unlockLetter(letterId, password);
    setUnlockedLetter(letter);

    // After animation delay in EnvelopeScreen, switch to letter view
    setTimeout(() => {
      setView('letter');
    }, 2400);
  };

  // Admin login handler
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('romantic_admin_token', token);
    setAuthToken(token);
    setShowLoginModal(false);
    setView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('romantic_admin_token');
    setAuthToken(null);
    setView('envelope');
  };

  const handlePreviewLetter = (previewId: string) => {
    setLetterId(previewId);
    setUnlockedLetter(null);
    setView('envelope');
    window.history.pushState({}, '', `/?letter=${previewId}`);
  };

  return (
    <div
      className="relative w-full min-h-screen flex flex-col justify-between overflow-x-hidden"
      dir="rtl"
      style={{ backgroundColor: currentDesign.backgroundColor }}
    >
      {/* Ambient background particles & vintage gradient */}
      <AmbientBackground
        backgroundColor={currentDesign.backgroundColor}
        showParticles={currentDesign.showParticles}
      />

      {/* Floating Background Music Player */}
      {view !== 'admin' && (
        <MusicPlayer
          musicUrl={unlockedLetter?.music_url || publicData?.music_url}
          musicEnabled={
            unlockedLetter ? unlockedLetter.music_enabled : publicData?.music_enabled ?? true
          }
          autoPlayTrigger={view === 'letter' || view === 'memories'}
          goldAccentColor={currentDesign.goldAccentColor}
        />
      )}

      {/* Discreet Admin Button (accessible for creator) */}
      <div className="fixed bottom-3 right-3 z-40 opacity-40 hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            if (authToken) {
              setView(view === 'admin' ? 'envelope' : 'admin');
            } else {
              setShowLoginModal(true);
            }
          }}
          className="p-2 rounded-full bg-[#230408]/50 hover:bg-[#590D19] border border-[#D5B47A]/25 text-[#D5B47A]/60 hover:text-[#D5B47A] backdrop-blur-md transition-all shadow-sm"
          title="لوحة تحكم صاحب الرسالة (المدير)"
        >
          {authToken && view === 'admin' ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Settings className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Views Router */}
      <AnimatePresence mode="wait">
        {view === 'admin' && authToken ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1"
          >
            <AdminDashboard
              token={authToken}
              onLogout={handleLogout}
              onPreviewLetter={handlePreviewLetter}
            />
          </motion.div>
        ) : view === 'memories' && unlockedLetter ? (
          <motion.div
            key="memories"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-full flex-1 flex flex-col justify-center py-4 sm:py-8"
          >
            <MemoriesGallery
              memories={unlockedLetter.memories || []}
              onBackToLetter={() => setView('letter')}
              goldAccentColor={currentDesign.goldAccentColor}
            />
          </motion.div>
        ) : view === 'letter' && unlockedLetter ? (
          <motion.div
            key="letter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex-1 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10 my-auto"
          >
            <LetterCard
              letter={unlockedLetter}
              onOpenMemories={() => setView('memories')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex-1 flex items-center justify-center py-6 sm:py-10"
          >
            {loadError ? (
              <div className="text-center p-8 bg-[#3B080F]/90 rounded-2xl border border-red-500/30 max-w-md mx-auto">
                <p className="text-rose-200 font-amiri text-lg mb-4">{loadError}</p>
                <button
                  onClick={() => {
                    setLetterId(DEFAULT_LETTER_ID);
                    window.history.pushState({}, '', '/');
                  }}
                  className="px-4 py-2 rounded-full bg-[#590D19] border border-[#D5B47A]/50 text-sm font-amiri text-[#F2E3C3]"
                >
                  العودة للرسالة الافتراضية
                </button>
              </div>
            ) : (
              <EnvelopeScreen
                letterId={letterId}
                designSettings={currentDesign}
                onUnlockSuccess={handleUnlock}
                isLoading={isLoadingPublicData}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setShowLoginModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
