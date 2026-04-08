/**
 * URL check orchestration service
 * Calls the backend API (Netlify function) to check URLs
 */

/**
 * Check a URL using the backend API
 * @param {string} url - The URL to check
 * @returns {Promise<CheckResult>} Aggregated result with verdict, threat info, and sources
 */
export async function checkUrl(url) {
  try {
    // Call Netlify function (works in dev via proxy and in production)
    const endpoint = '/.netlify/functions/check-url';
    
    console.log('Calling backend API:', endpoint, 'with URL:', url);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Backend result:', result);
    return result;
  } catch (error) {
    console.error('Check URL error:', error);
    // Return UNKNOWN verdict on error
    return {
      verdict: 'UNKNOWN',
      sources: [],
      error: 'Service unavailable'
    };
  }
}
