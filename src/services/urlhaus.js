/**
 * URLhaus API client service
 * Checks URLs against abuse.ch URLhaus threat database
 */

/**
 * Check a URL against URLhaus API
 * @param {string} url - The URL to check
 * @returns {Promise<ServiceResult>} Result object with safe status, threat type, and source
 */
export async function checkUrlhaus(url) {
  const endpoint = 'https://urlhaus-api.abuse.ch/v1/url/';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
    });

    if (!response.ok) {
      // HTTP error - treat as error state
      return {
        safe: false,
        error: true,
        source: 'URLhaus'
      };
    }

    const data = await response.json();

    // Check query_status field
    // "ok" means the URL is listed in the database (threat)
    // "no_results" means the URL is not listed (clean)
    if (data.query_status === 'ok') {
      // URL is listed as a threat
      const threatType = extractThreatType(data);
      return {
        safe: false,
        threatType,
        source: 'URLhaus'
      };
    } else if (data.query_status === 'no_results') {
      // URL is not listed - clean
      return {
        safe: true,
        source: 'URLhaus'
      };
    }

    // Unexpected query_status - treat as error
    return {
      safe: false,
      error: true,
      source: 'URLhaus'
    };
  } catch (error) {
    // Network error or other exception - return error state
    console.error('URLhaus API exception:', error);
    return {
      safe: false,
      error: true,
      source: 'URLhaus'
    };
  }
}

/**
 * Extract threat type from URLhaus response
 * @param {object} data - URLhaus API response
 * @returns {string} Human-readable threat label
 */
function extractThreatType(data) {
  // Try to get threat type from tags array
  if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
    return formatThreatTag(data.tags[0]);
  }

  // Fallback to threat field if available
  if (data.threat) {
    return formatThreatTag(data.threat);
  }

  // Default generic label
  return 'Malicious';
}

/**
 * Format URLhaus tag to human-readable label
 * @param {string} tag - Raw tag from URLhaus
 * @returns {string} Formatted threat label
 */
function formatThreatTag(tag) {
  // Capitalize first letter of each word
  return tag
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
