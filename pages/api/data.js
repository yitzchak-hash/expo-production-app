const DATA_KEY = 'tzviair_expo_v1';

function redisAvailable() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export default async function handler(req, res) {
  const code = req.headers['x-access-code'] || req.query.code;
  if (code !== '2141') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!redisAvailable()) {
    return res.status(503).json({ error: 'Redis not configured', localOnly: true });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    if (req.method === 'GET') {
      const data = await redis.get(DATA_KEY);
      return res.status(200).json({ data: data ?? null });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || !body.data) {
        return res.status(400).json({ error: 'Missing data' });
      }
      await redis.set(DATA_KEY, body.data);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Redis error:', err.message);
    return res.status(500).json({ error: 'Storage error' });
  }
}
