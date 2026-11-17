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
 * Uploads an audio file to a public host and returns an absolute HTTPS URL
 * (works from any device), or '' if every strategy failed.
 * Never returns local/relative/idb URLs, because those break in a shared link.
 */
export async function uploadAudioToCloud(fileOrBlob: File | Blob, filename = 'romantic-song.mp3'): Promise<string> {
  const safeName = encodeURIComponent(filename || 'romantic-song.mp3');

  // Strategy 1: Vercel serverless function (permanent Catbox link, files up to ~4.5MB)
  try {
    const res = await fetch(`/api/upload-music?filename=${safeName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: fileOrBlob,
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && data.url.startsWith('http')) return data.url;
    }
  } catch (e) {
    // proceed
  }

  // Strategy 2: Express backend (local/Render) – only accept absolute cloud URLs
  try {
    const formData = new FormData();
    formData.append('music', fileOrBlob, filename);
    const res = await fetch('/api/upload/music', { method: 'POST', body: formData });
    if (res.ok) {
      const data = await res.json();
      if (data?.url && data.url.startsWith('http')) return data.url;
    }
  } catch (e) {
    // proceed
  }

  // Strategy 3: Litterbox directly from the browser (CORS enabled, link lasts 72h)
  try {
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('time', '72h');
    fd.append('fileToUpload', fileOrBlob, filename);
    const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: fd,
    });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.startsWith('http')) return text;
    }
  } catch (err) {
    console.warn('Litterbox audio upload failed:', err);
  }

  return '';
}
