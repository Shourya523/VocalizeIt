const express = require('express');
const router = express.Router();

router.post('/synthesize', async (req, res) => {
  const { text, voice = 'en-US-AriaNeural', rate = '0%', pitch = '0%' } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('Synthesizing text with Azure:', text.substring(0, 50) + '...');
    console.log('Using voice:', voice);
    
    const { apiKey, region } = req.azureConfig;

    // Create SSML (Speech Synthesis Markup Language)
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Azure TTS REST API endpoint
    const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: ssml
    });

    console.log('Azure API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure API Error:', response.status, errorText);
      
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Authentication failed',
          details: 'Azure Speech Services API key is invalid'
        });
      } else if (response.status === 403) {
        return res.status(403).json({ 
          error: 'Access denied',
          details: 'Check your Azure subscription and resource permissions'
        });
      } else if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        });
      } else {
        return res.status(response.status).json({ 
          error: 'Azure TTS API error',
          details: errorText
        });
      }
    }

    const audioBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    console.log('Successfully generated audio with Azure, buffer size:', buffer.length);
    res.json({ 
      audioContent: buffer.toString('base64'),
      voice: voice,
      contentType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('Azure synthesis error:', error);
    res.status(500).json({ 
      error: 'Failed to synthesize speech with Azure',
      details: error.message
    });
  }
});

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const { apiKey, region } = req.azureConfig;
    const voicesUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/voices/list`;
    
    const response = await fetch(voicesUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const voices = await response.json();
    
    // Filter for popular English voices
    const popularVoices = voices.filter(voice => 
      voice.Locale.startsWith('en-') && voice.VoiceType === 'Neural'
    ).slice(0, 20);

    res.json({
      voices: popularVoices.map(voice => ({
        name: voice.Name,
        displayName: voice.DisplayName,
        locale: voice.Locale,
        gender: voice.Gender,
        voiceType: voice.VoiceType
      }))
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;