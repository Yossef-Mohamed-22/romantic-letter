import { Letter, Memory, DesignSettings } from '../types/index.ts';

export interface CompactLetterPayload {
  t?: string; // Title
  r?: string; // Recipient Name
  m?: string; // Message
  c?: string; // Closing Message
  mu?: string; // Music URL
  me?: boolean; // Music Enabled
  ds?: Partial<DesignSettings>; // Design settings overrides
  mem?: {
    u: string; // Image URL
    c: string; // Caption
    o?: number; // Display order
  }[];
  v?: number; // Version
}

/**
 * Encodes letter details and memories into a compact, URL-safe Base64 string.
 * Supports UTF-8 Arabic text, emojis, and symbols.
 */
export function encodeLetterToPayload(letter: {
  title: string;
  recipient_name: string;
  message: string;
  closing_message: string;
  music_url?: string;
  music_enabled?: boolean;
  design_settings?: DesignSettings;
  memories?: { image_url: string; caption: string; display_order?: number }[];
}): string {
  const payload: CompactLetterPayload = {
    v: 1,
    t: letter.title,
    r: letter.recipient_name,
    m: letter.message,
    c: letter.closing_message,
    mu: letter.music_url,
    me: letter.music_enabled !== false,
    ds: letter.design_settings,
    mem: (letter.memories || []).map((mem, idx) => ({
      u: mem.image_url?.startsWith('data:') ? 'https://iili.io/o2g5zWG.jpg' : mem.image_url,
      c: mem.caption,
      o: mem.display_order || idx + 1,
    })),
  };

  const json = JSON.stringify(payload);
  const utf8Bytes = new TextEncoder().encode(json);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  // URL safe replacements: + -> -, / -> _, trim =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe Base64 string back into letter properties.
 */
export function decodeLetterFromPayload(encoded: string): Partial<Letter> | null {
  if (!encoded || !encoded.trim()) return null;
  try {
    let base64 = encoded.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const payload: CompactLetterPayload = JSON.parse(json);

    const memories: Memory[] = (payload.mem || []).map((m, idx) => ({
      id: `mem-payload-${idx + 1}`,
      letter_id: 'secret-love-letter',
      image_url: m.u || '/images/memory-1.jpg',
      caption: m.c || '',
      display_order: m.o || idx + 1,
    }));

    return {
      title: payload.t,
      recipient_name: payload.r,
      message: payload.m,
      closing_message: payload.c,
      music_url: payload.mu,
      music_enabled: payload.me !== false,
      design_settings: payload.ds as DesignSettings | undefined,
      memories: memories.length > 0 ? memories : undefined,
    };
  } catch (err) {
    console.warn('Failed to decode letter payload from URL:', err);
    return null;
  }
}
