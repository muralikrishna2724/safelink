document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const targetUrl = params.get('url');
    const urlDisplay = document.getElementById('urlDisplay');

    if (!targetUrl) {
        urlDisplay.textContent = 'No URL provided.';
        return;
    }

    // Basic sanitization for display
    const dummyNode = document.createElement('div');
    dummyNode.textContent = targetUrl;
    urlDisplay.innerHTML = dummyNode.innerHTML;

    // Send message to background script to check the URL
    chrome.runtime.sendMessage({ action: 'verify_url', url: targetUrl }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error communicating with background script", chrome.runtime.lastError);
            // Default to safe on error so we don't break the internet
            window.location.replace(targetUrl);
            return;
        }

        if (response && response.safe) {
            // URL is verified safe, proceed to the requested site
            window.location.replace(targetUrl);
        } else {
            // URL is malicious, redirect to warning page
            const warningUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(targetUrl)}`);
            window.location.replace(warningUrl);
        }
    });
});
