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
import { decodeLetterFromPayload } from './services/letterCodec.ts';

const DEFAULT_LETTER_ID = 'secret-love-letter';

export const App: React.FC = () => {
  // Extract letter ID from URL query param e.g. ?letter=123
  const getLetterIdFromUrl = (): string => {
    const params = new URLSearchParams(window.location.search);
    return params.get('letter') || DEFAULT_LETTER_ID;
  };

  // Helper to extract custom encoded payload from URL (?data=... or #data=...)
  const getEncodedPayloadFromUrl = (): Partial<Letter> | null => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data') || (window.location.hash.startsWith('#data=') ? window.location.hash.replace('#data=', '') : '');
    if (dataParam) {
      return decodeLetterFromPayload(dataParam);
    }
    return null;
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
        const payloadData = getEncodedPayloadFromUrl();
        const data = await api.getPublicLetter(letterId);

        if (payloadData) {
          if (payloadData.title) data.title = payloadData.title;
          if (payloadData.music_url) {
            data.music_url = payloadData.music_url;
            data.music_enabled = payloadData.music_enabled !== false;
          }
          if (payloadData.design_settings) {
            data.design_settings = {
              ...data.design_settings,
              ...payloadData.design_settings,
            };
          }
        }

        const params = new URLSearchParams(window.location.search);
        const musicParam = params.get('music');
        if (musicParam) {
          data.music_url = musicParam;
          data.music_enabled = true;
        }

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
  const handleUnlock = async (password?: string): Promise<void> => {
    const baseLetter = await api.unlockLetter(letterId, password);
    const payloadData = getEncodedPayloadFromUrl();

    let mergedLetter: Letter = {
      ...baseLetter,
    };

    if (payloadData) {
      if (payloadData.title) mergedLetter.title = payloadData.title;
      if (payloadData.recipient_name) mergedLetter.recipient_name = payloadData.recipient_name;
      if (payloadData.message) mergedLetter.message = payloadData.message;
      if (payloadData.closing_message) mergedLetter.closing_message = payloadData.closing_message;
      if (payloadData.music_url) {
        mergedLetter.music_url = payloadData.music_url;
        mergedLetter.music_enabled = payloadData.music_enabled !== false;
      }
      if (payloadData.design_settings) {
        mergedLetter.design_settings = {
          ...mergedLetter.design_settings,
          ...payloadData.design_settings,
        };
      }
      if (payloadData.memories && payloadData.memories.length > 0) {
        mergedLetter.memories = payloadData.memories;
      }
    }

    const params = new URLSearchParams(window.location.search);
    const musicParam = params.get('music');
    if (musicParam) {
      mergedLetter.music_url = musicParam;
      mergedLetter.music_enabled = true;
    }
    const toParam = params.get('to');
    if (toParam) {
      mergedLetter.recipient_name = toParam;
    }

    setUnlockedLetter(mergedLetter);

    // Fast, responsive, buttery-smooth transition to letter view
    setTimeout(() => {
      setView('letter');
    }, 1100);
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

  const handlePreviewLetter = (previewId: string, encodedPayload?: string) => {
    setLetterId(previewId);
    setUnlockedLetter(null);
    setView('envelope');
    if (encodedPayload) {
      window.history.pushState({}, '', `/?data=${encodedPayload}`);
    } else {
      window.history.pushState({}, '', `/?letter=${previewId}`);
    }
  };

  // Check if admin gear should be visible: ONLY if creator has token or URL has ?admin=true
  const params = new URLSearchParams(window.location.search);
  const showAdminGear = Boolean(authToken) || params.get('admin') === 'true';

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

      {/* Admin Gear Button - ONLY visible to creator/admin, completely hidden from normal letter recipients */}
      {showAdminGear && (
        <div className="fixed bottom-3 right-3 z-40 opacity-70 hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              if (authToken) {
                setView(view === 'admin' ? 'envelope' : 'admin');
              } else {
                setShowLoginModal(true);
              }
            }}
            className="p-2.5 rounded-full bg-[#230408]/80 hover:bg-[#590D19] border border-[#D5B47A]/40 hover:border-[#D5B47A] text-[#D5B47A]/80 hover:text-[#D5B47A] backdrop-blur-md transition-all shadow-md cursor-pointer"
            title="لوحة تحكم صاحب الرسالة (المدير)"
          >
            {authToken && view === 'admin' ? (
              <Lock className="w-4 h-4 text-[#D5B47A]" />
            ) : (
              <Settings className="w-4 h-4 text-[#D5B47A]" />
            )}
          </button>
        </div>
      )}

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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full flex-1 flex items-center justify-center p-3 sm:p-6 py-6 sm:py-10 my-auto transform-gpu"
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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full flex-1 flex items-center justify-center py-6 sm:py-10 transform-gpu"
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
