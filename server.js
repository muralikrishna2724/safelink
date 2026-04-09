import express from 'express';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/check-url', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const urlhausResult = await checkUrlhaus(url);
    const verdict = urlhausResult.safe ? 'SAFE' : (urlhausResult.error ? 'UNKNOWN' : 'UNSAFE');

    res.json({
      verdict,
      threatType: urlhausResult.threatType || null,
      sources: [urlhausResult]
    });
  } catch (error) {
    res.status(500).json({ verdict: 'UNKNOWN', error: 'Service unavailable', sources: [] });
  }
});

async function checkUrlhaus(url) {
  try {
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Auth-Key':'4f71e3a5c41522c4d8e728cf50f8c1111a5914f776dec245' },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!response.ok) return { safe: false, error: true, source: 'URLhaus' };

    const data = await response.json();

    if (data.query_status === 'ok') {
      const threatType = (data.tags && data.tags[0]) || 'Malicious';
      return { safe: false, threatType, source: 'URLhaus' };
    } else if (data.query_status === 'no_results') {
      return { safe: true, source: 'URLhaus' };
    }

    return { safe: false, error: true, source: 'URLhaus' };
  } catch {
    return { safe: false, error: true, source: 'URLhaus' };
  }
}

app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
