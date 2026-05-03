const express = require('express');
const router = express.Router();
const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");
const multer = require('multer');
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || pdfParseModule;

function base64EncodeUint8Array(uint8Array) {
  const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let i;
  const len = uint8Array.length;
  const extraBytes = len % 3;
  const parts = [];

  for (i = 0; i < len - extraBytes; i += 3) {
    const chunk = (uint8Array[i] << 16) | (uint8Array[i + 1] << 8) | uint8Array[i + 2];
    parts.push(
      lookup[(chunk >> 18) & 0x3f] +
      lookup[(chunk >> 12) & 0x3f] +
      lookup[(chunk >> 6) & 0x3f] +
      lookup[chunk & 0x3f]
    );
  }

  if (extraBytes === 1) {
    const chunk = uint8Array[len - 1];
    parts.push(
      lookup[(chunk >> 2) & 0x3f] +
      lookup[(chunk << 4) & 0x3f] +
      '=='
    );
  } else if (extraBytes === 2) {
    const chunk = (uint8Array[len - 2] << 8) | uint8Array[len - 1];
    parts.push(
      lookup[(chunk >> 10) & 0x3f] +
      lookup[(chunk >> 4) & 0x3f] +
      lookup[(chunk << 2) & 0x3f] +
      '='
    );
  }

  return parts.join('');
}

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/synthesize', async (req, res) => {
  const { 
    text, 
    voiceId = 'pNInz6obpgDQGcFmaJgB', 
    stability = 0.5, 
    similarity_boost = 0.5 
  } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use credentials from middleware[cite: 1]
    const { apiKey } = req.elevenLabsConfig;
    const elevenlabs = new ElevenLabsClient({ apiKey });

    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
      voice_settings: {
        stability,
        similarity_boost,
      }
    });

    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const audioBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBytes.set(chunk, offset);
      offset += chunk.length;
    }

    const audioContent = base64EncodeUint8Array(audioBytes);

    res.json({
      audioContent,
      voiceId: voiceId,
      contentType: 'audio/mpeg'
    });

  } catch (error) {
    console.error('ElevenLabs synthesis error:', error);
    res.status(500).json({
      error: 'Failed to synthesize speech with ElevenLabs',
      details: error.message
    });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const { apiKey } = req.elevenLabsConfig;
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const data = await elevenlabs.voices.getAll();

    res.json({
      voices: data.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        previewUrl: voice.preview_url,
        labels: voice.labels
      }))
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to extract text from PDF
router.post('/extract-text', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const pdfData = new Uint8Array(req.file.buffer);
    const parser = new PDFParse(pdfData);
    const data = await parser.getText();
    const text = data?.text || '';

    res.json({ text });

  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    res.status(500).json({ error: 'Failed to extract text from PDF', details: error.message });
  }
});

// Route to isolate voice from audio
router.post('/isolate', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
    
    const { apiKey } = req.elevenLabsConfig;
    
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('audio', blob, req.file.originalname);
    
    const response = await fetch('https://api.elevenlabs.io/v1/audio-isolation', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBytes = new Uint8Array(arrayBuffer);
    const audioContent = base64EncodeUint8Array(audioBytes);
    
    res.json({
      audioContent,
      contentType: 'audio/mpeg'
    });
  } catch (error) {
    console.error('Error isolating audio:', error);
    res.status(500).json({ error: 'Failed to isolate audio', details: error.message });
  }
});

// Route for Speech to Text
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Audio file is required' });
    
    const { apiKey } = req.elevenLabsConfig;
    
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('model_id', 'scribe_v1');
    
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    res.json({ text: data.text });
  } catch (error) {
    console.error('Error in speech to text:', error);
    res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
  }
});

// Route to initiate Dubbing
router.post('/dub', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    
    const targetLang = req.body.target_lang || 'es';
    const { apiKey } = req.elevenLabsConfig;
    
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append('file', blob, req.file.originalname);
    formData.append('target_lang', targetLang);
    formData.append('name', 'VocalizeIt Dubbing');
    
    // Free tiers require watermark=true, but it only works on video files.
    if (req.file.mimetype.startsWith('video/')) {
      formData.append('watermark', 'true');
    }

    const response = await fetch('https://api.elevenlabs.io/v1/dubbing', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error initiating dubbing:', error);
    res.status(500).json({ error: 'Failed to initiate dubbing', details: error.message });
  }
});

// Route to check Dubbing status and fetch file
router.get('/dub/:dubbingId', async (req, res) => {
  try {
    const { dubbingId } = req.params;
    const { apiKey } = req.elevenLabsConfig;
    
    const metaResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}`, {
      headers: { 'xi-api-key': apiKey }
    });
    
    if (!metaResponse.ok) {
      const errText = await metaResponse.text();
      throw new Error(`ElevenLabs API error: ${metaResponse.status} ${errText}`);
    }
    
    const metaData = await metaResponse.json();
    
    if (metaData.status !== 'dubbed') {
      return res.json({ status: metaData.status });
    }
    
    const targetLang = metaData.target_languages && metaData.target_languages.length > 0 ? metaData.target_languages[0] : 'es';
    
    const fileResponse = await fetch(`https://api.elevenlabs.io/v1/dubbing/${dubbingId}/audio/${targetLang}`, {
      headers: { 'xi-api-key': apiKey }
    });
    
    if (!fileResponse.ok) {
      const errText = await fileResponse.text();
      throw new Error(`ElevenLabs API error fetching file: ${fileResponse.status} ${errText}`);
    }
    
    const arrayBuffer = await fileResponse.arrayBuffer();
    const audioBytes = new Uint8Array(arrayBuffer);
    const audioContent = base64EncodeUint8Array(audioBytes);
    
    res.json({
      status: 'dubbed',
      audioContent,
      contentType: fileResponse.headers.get('content-type') || 'audio/mpeg'
    });
    
  } catch (error) {
    console.error('Error fetching dubbing status:', error);
    res.status(500).json({ error: 'Failed to fetch dubbing status', details: error.message });
  }
});

module.exports = router;