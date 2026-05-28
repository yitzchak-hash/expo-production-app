const DATA_KEY = 'tzviair_expo_v1';

function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export default async function handler(req, res) {
  const code = req.headers['x-access-code'] || req.query.code;
  if (code !== '2141') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!kvAvailable()) {
    return res.status(503).json({ error: 'KV not configured', localOnly: true });
  }

  try {
    const { kv } = await import('@vercel/kv');

    if (req.method === 'GET') {
      const data = await kv.get(DATA_KEY);
      return res.status(200).json({ data: data ?? null });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.data) {
        return res.status(400).json({ error: 'Missing data' });
      }
      await kv.set(DATA_KEY, body.data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('KV error:', err.message);
    return res.status(500).json({ error: 'Storage error' });
  }
}
