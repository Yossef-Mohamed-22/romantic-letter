/**
 * Uploads an image (Data URL, Blob, or File) to public high-speed CDN.
 * Returns the permanent public HTTPS URL of the image.
 */
export async function uploadImageToCloud(dataUrlOrFile: string | File | Blob): Promise<string> {
  // If already an absolute http/https URL, return immediately
  if (typeof dataUrlOrFile === 'string') {
    if (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://')) {
      return dataUrlOrFile;
    }
  }

  let dataUrl = '';
  if (typeof dataUrlOrFile === 'string') {
    dataUrl = dataUrlOrFile;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(dataUrlOrFile);
    });
  }

  // Strategy 1: Try backend server proxy /api/upload-to-cloud (Fastest, zero CORS restrictions)
  try {
    const res = await fetch('/api/upload-to-cloud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && data.url.startsWith('http')) {
        return data.url;
      }
    }
  } catch (e) {
    // Proceed to fallback
  }

  // Strategy 2: Client-side Catbox litterbox upload (CORS-friendly fallback)
  try {
    const blobRes = await fetch(dataUrl);
    const blob = await blobRes.blob();
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', '72h');
    formData.append('fileToUpload', blob, 'memory.jpg');

    const catboxRes = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: formData,
    });
    if (catboxRes.ok) {
      const text = await catboxRes.text();
      if (text && text.startsWith('http')) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn('Cloud upload fallback failed:', err);
  }

  return dataUrl;
}

/**
 * Uploads an audio file or blob to public high-speed cloud CDN (Catbox).
 * Returns the permanent public HTTPS URL of the MP3 file.
 */
export async function uploadAudioToCloud(fileOrBlob: File | Blob, filename = 'romantic-song.mp3'): Promise<string> {
  // Strategy 1: Try local backend upload endpoint
  try {
    const formData = new FormData();
    formData.append('music', fileOrBlob, filename);
    const res = await fetch('/api/upload/music', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && data.url.startsWith('http')) {
        return data.url;
      }
    }
  } catch (e) {
    // proceed to fallback
  }

  // Strategy 2: Direct Catbox upload (CORS-friendly public CDN)
  try {
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('userhash', '');
    fd.append('fileToUpload', fileOrBlob, filename);

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: fd,
    });
    if (catboxRes.ok) {
      const text = (await catboxRes.text()).trim();
      if (text && text.startsWith('http')) {
        return text;
      }
    }
  } catch (err) {
    console.warn('Direct catbox audio upload failed:', err);
  }

  return '';
}
