import { DesignSettings, Letter, LetterPublicMetadata, Memory } from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Public Envelope & Unlocking
  getPublicLetter: async (id: string): Promise<LetterPublicMetadata> => {
    const res = await fetch(`${API_BASE}/letters/${id}/public`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل في تحميل الرسالة' }));
      throw new Error(err.error || 'فشل في العثور على الرسالة');
    }
    return res.json();
  },

  unlockLetter: async (id: string, nameOrPassword: string): Promise<Letter> => {
    const res = await fetch(`${API_BASE}/letters/${id}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameOrPassword, password: nameOrPassword }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'الاسم غير صحيح' }));
      throw new Error(err.error || 'هذه الرسالة كُتبت لأميرة أخرى.. تأكدي من كتابة اسمكِ بشكل صحيح ❤️');
    }

    const data = await res.json();
    return data.letter;
  },

  // Admin Auth
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تسجيل الدخول' }));
      throw new Error(err.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    return res.json();
  },

  checkAuth: async (token: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Admin Letters CRUD
  getLetters: async (token: string): Promise<Letter[]> => {
    const res = await fetch(`${API_BASE}/letters`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('فشل في جلب الرسائل');
    return res.json();
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
    const res = await fetch(`${API_BASE}/letters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(letterData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل إنشاء الرسالة' }));
      throw new Error(err.error || 'فشل إنشاء الرسالة');
    }
    return res.json();
  },

  updateLetter: async (token: string, id: string, updates: Partial<Letter & { secret_password?: string }>): Promise<Letter> => {
    const res = await fetch(`${API_BASE}/letters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل تحديث الرسالة' }));
      throw new Error(err.error || 'فشل تحديث الرسالة');
    }
    return res.json();
  },

  deleteLetter: async (token: string, id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/letters/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('فشل حذف الرسالة');
  },

  updateMemories: async (token: string, letterId: string, memories: Omit<Memory, 'id' | 'letter_id'>[]): Promise<Memory[]> => {
    const res = await fetch(`${API_BASE}/letters/${letterId}/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ memories }),
    });

    if (!res.ok) throw new Error('فشل حفظ الذكريات');
    return res.json();
  },

  // File Uploads
  uploadImage: async (token: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل رفع الصورة' }));
      throw new Error(err.error || 'فشل رفع الصورة');
    }

    const data = await res.json();
    return data.url;
  },

  uploadMusic: async (token: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('music', file);

    const res = await fetch(`${API_BASE}/upload/music`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'فشل رفع الملف الصوتي' }));
      throw new Error(err.error || 'فشل رفع الملف الصوتي');
    }

    const data = await res.json();
    return data.url;
  },
};
