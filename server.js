import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

// STT Endpoint for FreePBX AGI
app.post('/ai/stt', upload.single('audio'), async (req, res) => {
  try {
    const audioBytes = fs.readFileSync(req.file.path).toString('base64');
    const body = {
      audio: { content: audioBytes },
      config: {
        encoding: "LINEAR16",  // .gsm files from Asterisk use this encoding
        sampleRateHertz: 8000,
        languageCode: "en-US",
        model: 'telephony', // Optimized for phone call audio
        enableAutomaticPunctuation: true
      }
    };

    const { data } = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_API_KEY}`,
      body
    );

    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "Could not transcribe audio.";
    console.log("--> Transcription Result:", transcript);

    // This response is sent back to Asterisk but not used in the current AGI script.
    res.json({ transcript });

  } catch (e) {
    console.error("Error in STT endpoint:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    // Clean up the uploaded file
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI test server running on port ${port}`));