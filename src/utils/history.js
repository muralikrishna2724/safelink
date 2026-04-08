const STORAGE_KEY = 'safelink_history';
const MAX_HISTORY_SIZE = 10;

/**
 * Retrieves the check history from localStorage.
 * @returns {Array<{url: string, verdict: string, timestamp: string}>} Array of history entries
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (error) {
    // Silently swallow errors (e.g., localStorage unavailable, JSON parse error)
    return [];
  }
}

/**
 * Adds a new entry to the history, prepending it and keeping only the most recent 10.
 * @param {{url: string, verdict: string, timestamp: string}} entry - The history entry to add
 */
export function addToHistory(entry) {
  try {
    const history = getHistory();
    const updatedHistory = [entry, ...history].slice(0, MAX_HISTORY_SIZE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    // Silently swallow errors (e.g., localStorage unavailable, quota exceeded)
  }
}

/**
 * Clears all history entries from localStorage.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Silently swallow errors (e.g., localStorage unavailable)
  }
}
