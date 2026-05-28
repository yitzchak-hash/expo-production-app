import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.headers['x-access-code'] !== '2141') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Blob not configured' });
  }
  try {
    const filename = req.query.filename || `file-${Date.now()}`;
    const blob = await put(filename, req, { access: 'public' });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Blob upload error:', err.message);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
