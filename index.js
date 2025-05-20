const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create a directory for storing generated images
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Valid API keys (in a real app, this would be in a database)
const validApiKeys = [
    'c0957e34a11786192e8819a7d4faef725c3a0becf05716823b30e37111196e92ba1953a695dddd761cce8abbffefce40da8059d06aa651a02f9cc3322a7d1e0b',
    // Add 99 more keys for your real implementation
];

// Create 99 more random API keys for testing
for (let i = 0; i < 99; i++) {
    const randomKey = Array(128).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    validApiKeys.push(randomKey);
}

// Store signatures with expiration
const signatures = {};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !validApiKeys.includes(authHeader)) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }

    req.apiKey = authHeader;
    next();
};

// Authentication endpoint
app.post('/auth', authenticate, (req, res) => {
    // Generate a signature (in a real app, use a secure method)
    const signature = generateSignature();

    // Store signature with 10 second expiration
    signatures[signature] = {
        created: Date.now(),
        expires: Date.now() + 10000, // 10 seconds
    };

    res.json({ signature });
});

// Image Generation endpoint
app.post('/generate_image', authenticate, (req, res) => {
    const { signature, prompt } = req.body;

    // Validate signature
    if (!signature || !signatures[signature]) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // Check if signature has expired
    if (Date.now() > signatures[signature].expires) {
        delete signatures[signature]; // Clean up expired signature
        return res.status(401).json({ error: 'Signature expired' });
    }

    // Process the prompt and generate image URL
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate a 1-pixel image and return its URL
    const imageUrl = generateOnePixelImage(prompt);
    res.json(imageUrl);
});

// Helper function to generate a random signature (78-80 characters)
function generateSignature() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 78 + Math.floor(Math.random() * 3); // Random length between 78-80
    let signature = '';

    for (let i = 0; i < length; i++) {
        signature += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return signature;
}

// Function to generate a 1-pixel image
function generateOnePixelImage(prompt) {
    // Create a simple 1-pixel PNG base64 string for different colors
    // Simple hash of the prompt to determine color (for variety)
    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 16777215;
    const color = hash.toString(16).padStart(6, '0');

    // Create a filename based on a sanitized version of the prompt
    const sanitizedPrompt = prompt.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
    const filename = `${Date.now()}_${sanitizedPrompt}.png`;
    const filepath = path.join(imagesDir, filename);

    // Create a 1x1 pixel PNG image with the color
    // In a real app, you'd use a graphics library, but this is a mock
    // Here we'll just write a simple file and return its URL

    // This is a 1x1 pixel PNG template
    const onePixelPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    const imageBuffer = Buffer.from(onePixelPngBase64, 'base64');
    fs.writeFileSync(filepath, imageBuffer);

    return `/images/${filename}`;
}

// Clean up expired signatures periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(signatures).forEach(key => {
        if (now > signatures[key].expires) {
            delete signatures[key];
        }
    });
}, 30000); // Run every 30 seconds

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the server at http://localhost:${PORT}`);
}); 