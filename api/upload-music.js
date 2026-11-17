// Vercel serverless function: proxies an audio file to Catbox (permanent hosting).
// Browsers cannot upload to catbox.moe directly (no CORS), so this runs server-side.
// Vercel request body limit is ~4.5MB.
export const config = { api: { bodyParser: false } };

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const buffer = await readBody(req);
    if (!buffer.length) return res.status(400).json({ error: 'empty file' });

    const filename = (req.query && req.query.filename) || 'romantic-song.mp3';
    const fd = new FormData();
    fd.append('reqtype', 'fileupload');
    fd.append('userhash', '');
    fd.append('fileToUpload', new Blob([buffer]), String(filename));

    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
    const text = (await r.text()).trim();
    if (r.ok && text.startsWith('http')) {
      return res.status(200).json({ url: text });
    }
    return res.status(502).json({ error: 'catbox upload failed', detail: text.slice(0, 200) });
  } catch (err) {
    return res.status(500).json({ error: String((err && err.message) || err) });
  }
}
