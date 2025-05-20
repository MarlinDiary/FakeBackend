# Fake AI Backend Server

A mock backend server that simulates an AI image generation service with authentication.

## Features

- Authentication API (`/auth`)
- Image Generation API (`/generate_image`)
- Supports 100 predefined API keys
- Signature-based authentication with 10-second expiration
- Built-in web UI for testing the API

## Installation

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

2. The server will run on port 3000 by default (can be changed via PORT environment variable)

3. Access the test UI in your browser at: http://localhost:3000

## Web UI for Testing

The server includes a web-based UI for testing the API. To use it:

1. Open http://localhost:3000 in your browser
2. Enter one of the valid API keys (the test key or one of the generated keys)
3. Click "Get Signature" to obtain an authentication signature
4. Enter a prompt for image generation
5. Click "Generate Image" to create and view the generated 1-pixel image

## API Documentation

### Authentication API

**Endpoint**: `/auth`
**Method**: POST

**Headers**:
- `Authorization`: Your API key

**Response**:
```json
{
  "signature": "<digital-signature>"
}
```

### Image Generation API

**Endpoint**: `/generate_image`
**Method**: POST

**Headers**:
- `Authorization`: Your API key

**Body**:
```json
{
  "signature": "<the signature from auth API>",
  "prompt": "your image generation prompt"
}
```

**Response**: A URL to the generated image (mock)

## Example Usage

```javascript
// Get signature
const authResponse = await fetch('http://localhost:3000/auth', {
  method: 'POST',
  headers: {
    'Authorization': 'your-api-key',
    'Content-Type': 'application/json'
  }
});

const { signature } = await authResponse.json();

// Generate image
const imageResponse = await fetch('http://localhost:3000/generate_image', {
  method: 'POST',
  headers: {
    'Authorization': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    signature,
    prompt: 'a beautiful landscape'
  })
});

const imageUrl = await imageResponse.json();
``` 