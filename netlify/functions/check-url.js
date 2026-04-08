export async function handler(event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Check URLhaus (no API key needed)
    const urlhausResult = await checkUrlhaus(url);

    // For now, just use URLhaus since GSB has API key issues
    // You can add GSB later when you configure the API key properly
    const verdict = urlhausResult.safe ? 'SAFE' : (urlhausResult.error ? 'UNKNOWN' : 'UNSAFE');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        verdict,
        threatType: urlhausResult.threatType || null,
        sources: [urlhausResult]
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        verdict: 'UNKNOWN',
        error: 'Service unavailable',
        sources: []
      })
    };
  }
}

async function checkUrlhaus(url) {
  try {
    const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!response.ok) {
      return { safe: false, error: true, source: 'URLhaus' };
    }

    const data = await response.json();

    if (data.query_status === 'ok') {
      const threatType = (data.tags && data.tags[0]) || 'Malicious';
      return { safe: false, threatType, source: 'URLhaus' };
    } else if (data.query_status === 'no_results') {
      return { safe: true, source: 'URLhaus' };
    }

    return { safe: false, error: true, source: 'URLhaus' };
  } catch (error) {
    return { safe: false, error: true, source: 'URLhaus' };
  }
}
