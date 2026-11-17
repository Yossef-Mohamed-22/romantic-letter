/**
 * Shortens a long URL using is.gd (CORS-enabled, no API key).
 * Falls back to the original URL if shortening fails.
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const res = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.shorturl && String(data.shorturl).startsWith('http')) {
        return data.shorturl;
      }
    }
  } catch (err) {
    console.warn('URL shortening failed, using full link:', err);
  }
  return longUrl;
}
