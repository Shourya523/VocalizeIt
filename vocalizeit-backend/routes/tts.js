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

module.exports = router;