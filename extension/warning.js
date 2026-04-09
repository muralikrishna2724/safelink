document.addEventListener('DOMContentLoaded', () => {
    // Extract the blocked URL from the query string
    const params = new URLSearchParams(window.location.search);
    const blockedUrl = params.get('url');

    const urlDisplay = document.getElementById('urlDisplay');
    
    if (blockedUrl) {
        // Basic sanitization
        const dummyNode = document.createElement('div');
        dummyNode.textContent = blockedUrl;
        urlDisplay.innerHTML = dummyNode.innerHTML;
    } else {
        urlDisplay.textContent = 'Unknown URL';
    }

    // Go back to the previous page
    document.getElementById('goBackBtn').addEventListener('click', () => {
        window.history.length > 2 ? window.history.back() : window.close();
    });

    // Close the current tab
    document.getElementById('closeTabBtn').addEventListener('click', () => {
        window.close();
    });
});
