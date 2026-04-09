const AUTH_KEY = '4f71e3a5c41522c4d8e728cf50f8c1111a5914f776dec245';

// Manual testing blacklist
const BLOCKLIST = new Set(['facebook.com', 'www.facebook.com']);

// In-memory cache for fast synchronous checking during navigation
let safeDomains = new Set();

// Load persistent safe domains from storage on startup
chrome.storage.local.get(null, (items) => {
    for (const key in items) {
        if (items[key] === true) {
            safeDomains.add(key);
        }
    }
    console.log(`Loaded ${safeDomains.size} safe domains from cache.`);
});

// Intercept navigation before any network requests are sent
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    // Only care about the main frame (top-level page navigation)
    if (details.frameId !== 0) return;

    const url = details.url;

    // Ignore internal chrome urls, local extensions, or edge
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('edge://') || url.startsWith('about:')) {
        return;
    }

    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // 1. Is it manually blocked?
        if (BLOCKLIST.has(hostname)) {
            console.log(`URL ${url} is in local manual blacklist! Redirecting...`);
            const warningUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(url)}`);
            chrome.tabs.update(details.tabId, { url: warningUrl });
            return;
        }

        // 2. Is it in our fast in-memory safe cache?
        if (safeDomains.has(hostname)) {
            // Safe! Let the navigation proceed normally
            return;
        }

        // 3. Not checked yet! Abort navigation by redirecting to checking.html.
        console.log(`Domain ${hostname} is unknown. Diverting to checker UI...`);
        const checkingUrl = chrome.runtime.getURL(`checking.html?url=${encodeURIComponent(url)}`);
        chrome.tabs.update(details.tabId, { url: checkingUrl });

    } catch (e) {
        console.error("Invalid URL:", url);
    }
});

// Listen for the checking script to ask us to verify the URL
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'verify_url' && request.url) {
        const targetUrl = request.url;
        
        // Return Promise to allow async sendResponse
        checkUrlhaus(targetUrl, sendResponse);
        return true; 
    }
});

async function checkUrlhaus(url, sendResponse) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        const response = await fetch('https://urlhaus-api.abuse.ch/v1/url/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Auth-Key': AUTH_KEY
            },
            body: `url=${encodeURIComponent(url)}`
        });

        if (!response.ok) {
            console.warn("API returned non-OK status. Defaulting to safe.");
            return sendResponse({ safe: true });
        }

        const data = await response.json();

        if (data.query_status === 'ok') {
            // Malicious
            console.log(`URLhaus flagged ${url} as malicious.`);
            sendResponse({ safe: false });
        } else if (data.query_status === 'no_results' || data.query_status === 'invalid_url') {
            // Safe
            console.log(`URLhaus found no results. Marking ${hostname} as safe.`);
            safeDomains.add(hostname); // Add to in-memory cache
            chrome.storage.local.set({ [hostname]: true }); // Persist
            sendResponse({ safe: true });
        } else {
            // Default safe
            sendResponse({ safe: true });
        }
    } catch (error) {
        console.error("Error calling URLhaus:", error);
        sendResponse({ safe: true });
    }
}
