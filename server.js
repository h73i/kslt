const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const urlDatabase = new Map();

app.use(express.static('.'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/shorten', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL required' });
    }
    
    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    
    const shortCode = generateShortCode();
    urlDatabase.set(shortCode, url);
    
    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    
    res.json({ 
        shortUrl, 
        shortCode,
        originalUrl: url
    });
});

app.get('/:shortCode', (req, res) => {
    const { shortCode } = req.params;
    
    if (shortCode === 'api' || shortCode === 'favicon.ico') {
        return res.status(404).send('Not found');
    }
    
    const originalUrl = urlDatabase.get(shortCode);
    
    if (originalUrl) {
        res.redirect(302, originalUrl);
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>404 - Link Not Found</title>
                <style>
                    body { 
                        background-color: #000000; 
                        color: #ffffff; 
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    h1 { 
                        color: #ff006e; 
                        font-size: 3rem; 
                        margin-bottom: 1rem; 
                        font-weight: 700;
                    }
                    p { 
                        color: #666666; 
                        margin-bottom: 2rem; 
                        font-size: 1.1rem;
                    }
                    a { 
                        color: #00ffaa; 
                        text-decoration: none; 
                        font-weight: 600;
                        padding: 0.75rem 1.5rem;
                        border: 1px solid #00ffaa;
                        border-radius: 6px;
                        transition: all 0.2s ease;
                    }
                    a:hover { 
                        background-color: #00ffaa;
                        color: #000000;
                    }
                </style>
            </head>
            <body>
                <h1>404</h1>
                <p>This short link was not found</p>
                <a href="/">Go back home</a>
            </body>
            </html>
        `);
    }
});

function generateShortCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    do {
        result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (urlDatabase.has(result));
    
    return result;
}

app.listen(PORT, () => {
    console.log(`✨ kslt server running!`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
});