/**
 * Google Safe Browsing API v4 client service
 * Checks URLs against Google's threat database
 */

/**
 * Check a URL against Google Safe Browsing API v4
 * @param {string} url - The URL to check
 * @returns {Promise<ServiceResult>} Result object with safe status, threat type, and source
 */
export async function checkGoogleSafeBrowsing(url) {
  const apiKey = import.meta.env.VITE_GSB_API_KEY;

  // If API key is missing or empty, return error state
  if (!apiKey || apiKey.trim() === '') {
    return {
      safe: false,
      error: true,
      source: 'GSB'
    };
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;

  const requestBody = {
    client: {
      clientId: 'safelink',
      clientVersion: '1.0.0'
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION'
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }]
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // HTTP error - treat as error state
      console.error('GSB API error:', response.status, response.statusText);
      return {
        safe: false,
        error: true,
        source: 'GSB'
      };
    }

    const data = await response.json();

    // Check if there are any threat matches
    if (data.matches && data.matches.length > 0) {
      // Map the first threat type to human-readable label
      const threatType = mapThreatType(data.matches[0].threatType);
      return {
        safe: false,
        threatType,
        source: 'GSB'
      };
    }

    // No threats found - URL is clean
    return {
      safe: true,
      source: 'GSB'
    };
  } catch (error) {
    // Network error or other exception - return error state
    console.error('GSB API exception:', error);
    return {
      safe: false,
      error: true,
      source: 'GSB'
    };
  }
}

/**
 * Map GSB threat type enum to human-readable label
 * @param {string} threatType - GSB API threat type enum
 * @returns {string} Human-readable threat label
 */
function mapThreatType(threatType) {
  const mapping = {
    'MALWARE': 'Malware',
    'SOCIAL_ENGINEERING': 'Phishing',
    'UNWANTED_SOFTWARE': 'Unwanted Software',
    'POTENTIALLY_HARMFUL_APPLICATION': 'Potentially Harmful'
  };

  return mapping[threatType] || threatType;
}
