require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ttsRoutes = require('./routes/tts');

// Validate Azure credentials
const azureApiKey = process.env.AZURE_SPEECH_KEY;
const azureRegion = process.env.AZURE_SPEECH_REGION;

if (!azureApiKey || !azureRegion) {
  console.error("❌ Azure Speech credentials are missing:");
  console.error("   AZURE_SPEECH_KEY:", azureApiKey ? "✅ Set" : "❌ Missing");
  console.error("   AZURE_SPEECH_REGION:", azureRegion ? "✅ Set" : "❌ Missing");
  process.exit(1);
}

console.log("✅ Azure Speech credentials loaded successfully");
console.log("Region:", azureRegion);
console.log("API Key starts with:", azureApiKey.substring(0, 5));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Middleware to attach Azure credentials to each request
app.use((req, res, next) => {
  req.azureConfig = {
    apiKey: azureApiKey,
    region: azureRegion
  };
  next();
});

// Use the TTS routes
app.use('/api/tts', ttsRoutes);

// Debug endpoint
app.get('/debug-env', (req, res) => {
  res.json({
    azureKeyExists: !!azureApiKey,
    azureKeyLength: azureApiKey ? azureApiKey.length : 0,
    azureRegion: azureRegion || 'not set',
    firstFourChars: azureApiKey ? azureApiKey.substring(0, 4) : null,
    nodeEnv: process.env.NODE_ENV || 'not set'
  });
});

// Test Azure connection
app.get('/test-azure', async (req, res) => {
  try {
    console.log("Testing Azure Speech Services connection...");
    
    // Simple test using the REST API
    const testUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': azureApiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Azure API test failed: ${response.status} ${response.statusText}`);
    }

    const voices = await response.json();
    
    res.json({
      success: true,
      message: "Azure Speech Services connection successful",
      voiceCount: voices ? voices.length : 0,
      sampleVoices: voices ? voices.slice(0, 3).map(v => ({
        name: v.Name,
        locale: v.Locale,
        gender: v.Gender
      })) : []
    });
  } catch (error) {
    console.error("Azure test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});