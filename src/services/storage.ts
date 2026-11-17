// Client-side IndexedDB for large media (audio blobs & cropped images)
const DB_NAME = 'romantic_letter_storage';
const DB_VERSION = 1;
const AUDIO_STORE = 'audio_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAudioToIDB(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readwrite');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save to IndexedDB:', err);
  }
}

export async function getAudioFromIDB(key: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(AUDIO_STORE, 'readonly');
      const store = tx.objectStore(AUDIO_STORE);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read from IndexedDB:', err);
    return null;
  }
}

// Memory blob URL cache to prevent memory leaks
const objectUrlCache = new Map<string, string>();

export async function resolveAudioUrl(url?: string): Promise<string> {
  if (!url) return '';
  if (!url.startsWith('idb://')) return url;

  const key = url.replace('idb://', '');
  if (objectUrlCache.has(key)) {
    return objectUrlCache.get(key)!;
  }

  const blob = await getAudioFromIDB(key);
  if (blob) {
    const objUrl = URL.createObjectURL(blob);
    objectUrlCache.set(key, objUrl);
    return objUrl;
  }

  return '';
}
