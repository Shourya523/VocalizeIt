require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ttsRoutes = require('./routes/tts');

// Validate ElevenLabs credentials[cite: 1]
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

if (!elevenLabsApiKey) {
  console.error("❌ ElevenLabs credentials are missing:");
  console.error("   ELEVENLABS_API_KEY:", elevenLabsApiKey ? "✅ Set" : "❌ Missing");
  process.exit(1);
}

console.log("✅ ElevenLabs credentials loaded successfully");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Middleware to attach ElevenLabs configuration to each request[cite: 1]
app.use((req, res, next) => {
  req.elevenLabsConfig = {
    apiKey: elevenLabsApiKey
  };
  next();
});

// Use the TTS routes[cite: 1]
app.use('/api/tts', ttsRoutes);

// Debug endpoint[cite: 1]
app.get('/debug-env', (req, res) => {
  res.json({
    elevenLabsKeyExists: !!elevenLabsApiKey,
    elevenLabsKeyLength: elevenLabsApiKey ? elevenLabsApiKey.length : 0,
    nodeEnv: process.env.NODE_ENV || 'not set'
  });
});

// Test ElevenLabs connection[cite: 1]
app.get('/test-elevenlabs', async (req, res) => {
  try {
    console.log("Testing ElevenLabs connection...");
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: { 'xi-api-key': elevenLabsApiKey }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API test failed: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      message: "ElevenLabs connection successful",
      voiceCount: data.voices ? data.voices.length : 0
    });
  } catch (error) {
    console.error("ElevenLabs test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});