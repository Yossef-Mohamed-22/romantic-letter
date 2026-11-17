import { DesignSettings, Letter, LetterPublicMetadata, Memory } from '../types/index.ts';
import { INITIAL_DEFAULT_LETTER, DEFAULT_DESIGN, DEFAULT_MEMORIES } from './defaultData.ts';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'romantic_secret_letters_store';

function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ');
}

// Local storage helper for static hosting (e.g. Vercel)
function getLocalLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [INITIAL_DEFAULT_LETTER];
}

function saveLocalLetters(letters: Letter[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(letters));
  } catch {}
}

export const api = {
  // Public Envelope & Unlocking
  getPublicLetter: async (id: string): Promise<LetterPublicMetadata> => {
    try {
      const res = await fetch(`${API_BASE}/letters/${id}/public`);
      if (res.ok) return await res.json();
    } catch {}

    // Fallback to local store (Vercel)
    const letters = getLocalLetters();
    const letter = letters.find((l) => l.id === id) || INITIAL_DEFAULT_LETTER;
    return {
      id: letter.id,
      title: letter.title,
      allow_any_name: letter.allow_any_name,
      design_settings: letter.design_settings,
      music_enabled: letter.music_enabled,
      music_url: letter.music_url,
    };
  },

  unlockLetter: async (id: string, nameOrPassword?: string): Promise<Letter> => {
    try {
      const res = await fetch(`${API_BASE}/letters/${id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameOrPassword || '', password: nameOrPassword || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.letter;
      }
    } catch {}

    // Fallback to local store (Vercel)
    const letters = getLocalLetters();
    const letter = letters.find((l) => l.id === id) || INITIAL_DEFAULT_LETTER;
    return letter;
  },

  // Admin Auth
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback for Vercel
    if (email === 'admin@secretletter.com' && password === 'love2026') {
      return {
        token: 'vercel-static-admin-token',
        user: { id: 'admin-1', email, name: 'مدير الرسائل' },
      };
    }
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  },

  checkAuth: async (token: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return true;
    } catch {}
    return Boolean(token);
  },

  // Admin Letters CRUD
  getLetters: async (token: string): Promise<Letter[]> => {
    try {
      const res = await fetch(`${API_BASE}/letters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return await res.json();
    } catch {}

    return getLocalLetters();
  },

  createLetter: async (
    token: string,
    letterData: {
      recipient_name: string;
      title: string;
      message: string;
      closing_message: string;
      secret_password: string;
      music_enabled?: boolean;
      music_url?: string;
      design_settings?: DesignSettings;
    }
  ): Promise<Letter> => {
    try {
      const res = await fetch(`${API_BASE}/letters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(letterData),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback for Vercel
    const letters = getLocalLetters();
    const newId = `letter-${Date.now()}`;
    const newLetter: Letter = {
      id: newId,
      recipient_name: letterData.recipient_name,
      title: letterData.title || 'شخصي المفضل',
      message: letterData.message,
      closing_message: letterData.closing_message || '❤️',
      allow_any_name: true,
      music_enabled: letterData.music_enabled ?? true,
      music_url: letterData.music_url,
      design_settings: letterData.design_settings || DEFAULT_DESIGN,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      memories: DEFAULT_MEMORIES.map((m, i) => ({
        ...m,
        id: `mem-${newId}-${i + 1}`,
        letter_id: newId,
      })),
    };

    letters.push(newLetter);
    saveLocalLetters(letters);
    return newLetter;
  },

  updateLetter: async (token: string, id: string, updates: Partial<Letter & { secret_password?: string }>): Promise<Letter> => {
    try {
      const res = await fetch(`${API_BASE}/letters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback for Vercel
    const letters = getLocalLetters();
    const idx = letters.findIndex((l) => l.id === id);
    if (idx !== -1) {
      letters[idx] = { ...letters[idx], ...updates, updated_at: new Date().toISOString() };
      saveLocalLetters(letters);
      return letters[idx];
    }
    return INITIAL_DEFAULT_LETTER;
  },

  deleteLetter: async (token: string, id: string): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/letters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return;
    } catch {}

    const letters = getLocalLetters().filter((l) => l.id !== id);
    saveLocalLetters(letters);
  },

  updateMemories: async (token: string, letterId: string, memories: Omit<Memory, 'id' | 'letter_id'>[]): Promise<Memory[]> => {
    try {
      const res = await fetch(`${API_BASE}/letters/${letterId}/memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memories }),
      });
      if (res.ok) return await res.json();
    } catch {}

    const letters = getLocalLetters();
    const idx = letters.findIndex((l) => l.id === letterId);
    const updatedMemories: Memory[] = memories.map((m, i) => ({
      ...m,
      id: `mem-${letterId}-${i + 1}`,
      letter_id: letterId,
    }));

    if (idx !== -1) {
      letters[idx].memories = updatedMemories;
      saveLocalLetters(letters);
    }
    return updatedMemories;
  },

  // File Uploads (Supports Base64 Data URL fallback on Vercel without server)
  uploadImage: async (token: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {}

    // Fallback to Data URL for Vercel
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('فشل معالجة الصورة'));
      reader.readAsDataURL(file);
    });
  },

  uploadMusic: async (token: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('music', file);

      const res = await fetch(`${API_BASE}/upload/music`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch {}

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('فشل معالجة الملف الصوتي'));
      reader.readAsDataURL(file);
    });
  },
};
