/**
 * Uploads an image (Data URL, Blob, or File) to public high-speed CDN (FreeImage.host)
 * Returns the permanent public HTTPS URL of the image.
 */
export async function uploadImageToCloud(dataUrlOrFile: string | File | Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('key', '6d207e02198a847aa98d0a2a901485a5');
    formData.append('action', 'upload');
    formData.append('format', 'json');

    if (typeof dataUrlOrFile === 'string') {
      if (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://')) {
        return dataUrlOrFile;
      }
      if (dataUrlOrFile.startsWith('/images/')) {
        return dataUrlOrFile;
      }
      // Convert Data URL to Blob
      const response = await fetch(dataUrlOrFile);
      const blob = await response.blob();
      formData.append('source', blob, 'memory-photo.jpg');
    } else {
      formData.append('source', dataUrlOrFile);
    }

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.image?.url) {
        return data.image.url;
      }
    }
  } catch (err) {
    console.warn('Cloud image upload fallback:', err);
  }

  // Fallback if offline
  return typeof dataUrlOrFile === 'string' ? dataUrlOrFile : URL.createObjectURL(dataUrlOrFile);
}
