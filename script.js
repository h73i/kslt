async function shortenUrl() {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('shortenBtn');
    const result = document.getElementById('result');
    const shortUrlInput = document.getElementById('shortUrl');
    
    const url = input.value.trim();
    
    if (!url) {
        alert('Please enter a URL!');
        return;
    }
    
    if (!isValidUrl(url)) {
        alert('Please enter a valid URL!');
        return;
    }
    
    btn.textContent = 'Shortening...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            shortUrlInput.value = data.shortUrl;
            result.style.display = 'flex';
            input.value = '';
        } else {
            alert(data.error || 'An error occurred!');
        }
    } catch (error) {
        alert('Connection error!');
    } finally {
        btn.textContent = 'Shorten';
        btn.disabled = false;
    }
}

function copyUrl() {
    const shortUrlInput = document.getElementById('shortUrl');
    const copyBtn = document.getElementById('copyBtn');
    
    shortUrlInput.select();
    navigator.clipboard.writeText(shortUrlInput.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

document.getElementById('urlInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenUrl();
    }
});