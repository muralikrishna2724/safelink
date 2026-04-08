import validator from 'validator';

/**
 * Validates if a given string is a valid HTTP or HTTPS URL.
 * 
 * @param {string} url - The URL string to validate
 * @returns {boolean} - True if the URL is valid with http/https protocol, false otherwise
 */
export function isValidUrl(url) {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
}
