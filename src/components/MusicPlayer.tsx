import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { resolveAudioUrl } from '../services/storage.ts';

interface MusicPlayerProps {
  musicUrl?: string;
  musicEnabled?: boolean;
  autoPlayTrigger?: boolean;
  goldAccentColor?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicUrl,
  musicEnabled = true,
  autoPlayTrigger = false,
  goldAccentColor = '#D5B47A',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioSource, setAudioSource] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fallbackAudio =
    'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112199.mp3';
  const effectiveUrl = musicUrl || fallbackAudio;

  // Resolve IndexedDB or regular URL
  useEffect(() => {
    let isMounted = true;
    const resolve = async () => {
      if (effectiveUrl.startsWith('idb://')) {
        const resolved = await resolveAudioUrl(effectiveUrl);
        if (isMounted) setAudioSource(resolved || fallbackAudio);
      } else {
        if (isMounted) setAudioSource(effectiveUrl);
      }
    };
    resolve();
    return () => {
      isMounted = false;
    };
  }, [effectiveUrl]);

  // Attempt play when autoPlayTrigger becomes true (after envelope opened)
  useEffect(() => {
    if (musicEnabled && autoPlayTrigger && !isPlaying && !hasInteracted) {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch((err) => {
            console.log('Autoplay prevented by browser, waiting for user tap:', err);
          });
      }
    }
  }, [autoPlayTrigger, musicEnabled]);

  const togglePlay = () => {
    setHasInteracted(true);
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Audio playback failed:', err));
    }
  };

  if (!musicEnabled) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <audio ref={audioRef} src={audioSource || effectiveUrl} loop preload="auto" />

      <button
        onClick={togglePlay}
        aria-label={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
        className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#3B080F]/85 hover:bg-[#590D19] border border-[#D5B47A]/50 text-[#F2E3C3] backdrop-blur-md shadow-lg transition-all duration-300"
      >
        {/* Animated equalizer waves when playing */}
        {isPlaying ? (
          <div className="flex items-end gap-[2px] h-4 w-4">
            <span className="w-1 bg-[#D5B47A] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
            <span className="w-1 bg-[#D5B47A] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.2s] h-4" />
            <span className="w-1 bg-[#D5B47A] rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.4s] h-2" />
          </div>
        ) : (
          <VolumeX className="w-4 h-4 text-[#D5B47A]/70 group-hover:text-[#D5B47A]" />
        )}

        <span className="text-xs font-amiri text-[#F2E3C3]/80 group-hover:text-[#F2E3C3] hidden sm:inline">
          {isPlaying ? 'الموسيقى تعمل' : 'تشغيل الموسيقى'}
        </span>
      </button>
    </div>
  );
};
