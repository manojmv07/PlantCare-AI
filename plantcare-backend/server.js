const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const translationApiKey = 'AIzaSyBaPW9f5Xpy3fh8YODCMQKQbNW99jKNjFQ';

// Google TTS client
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: 'google-tts.json'
});

const speechClient = new speech.SpeechClient({ keyFilename: 'google-tts.json' });

// Batch Translation endpoint
app.post('/api/translate', async (req, res) => {
  const { texts, target } = req.body; // texts: array of strings, target: language code
  if (!Array.isArray(texts) || !target) {
    return res.status(400).json({ error: 'Invalid request. Provide texts (array) and target (language code).' });
  }
  const url = `https://translation.googleapis.com/language/translate/v2?key=${translationApiKey}`;
  try {
    const response = await (await import('node-fetch')).default(url, {
      method: 'POST',
      body: JSON.stringify({ q: texts, target, format: 'text' }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!data.data || !data.data.translations) {
      return res.status(500).json({ error: 'Translation API error', details: data });
    }
    const translations = data.data.translations.map(t => t.translatedText);
    res.json({ translations });
  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed', details: err.message || err });
  }
});

// TTS endpoint
app.post('/api/speak', async (req, res) => {
  const { text, languageCode } = req.body;
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' }
    });
    if (!response.audioContent) {
      console.error('TTS: No audioContent returned');
      return res.status(500).json({ error: 'TTS failed: No audio generated.' });
    }
    res.json({ audioContent: response.audioContent });
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed: ' + (err.message || err) });
  }
});

// Speech-to-Text endpoint
app.post('/api/stt', async (req, res) => {
  const { audioContent, mimeType } = req.body; // Accept mimeType from frontend if available
  if (!audioContent) {
    console.error('No audioContent received in /api/stt');
    return res.status(400).json({ error: 'No audioContent provided' });
  }
  const audio = { content: audioContent };
  // Limit to 5 key languages for better accuracy
  let config = {
    encoding: 'WEBM_OPUS', // default for webm
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    alternativeLanguageCodes: [
      'en-US', 'hi-IN', 'kn-IN', 'te-IN', 'ta-IN'
    ]
  };
  if (mimeType === 'audio/wav' || mimeType === 'audio/pcm') {
    config.encoding = 'LINEAR16';
    config.sampleRateHertz = 16000;
  } else if (mimeType === 'audio/webm' || !mimeType) {
    config.encoding = 'WEBM_OPUS';
    if (config.sampleRateHertz) delete config.sampleRateHertz;
  }
  const request = { audio, config };
  try {
    console.log('Received /api/stt request. audioContent length:', audioContent.length, 'mimeType:', mimeType);
    const [response] = await speechClient.recognize(request);
    const transcription = response.results?.map(r => r.alternatives[0].transcript).join(' ');
    const detectedLanguage = response.results?.[0]?.languageCode || 'en';
    res.json({ text: transcription, language: detectedLanguage });
  } catch (err) {
    console.error('Error in /api/stt:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5001, () => console.log('Server running on http://localhost:5001'));
