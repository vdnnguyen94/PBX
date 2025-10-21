import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import axios from 'axios';
import path from "path";

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });

// STT Endpoint for FreePBX AGI
app.post("/ai/stt", upload.single("audio"), async (req, res) => {
  try {
    const audioBytes = fs.readFileSync(req.file.path).toString("base64");

    // Determine encoding from extension
    const ext = path.extname(req.file.originalname || req.file.path).toLowerCase();
    const encoding = ext === ".gsm" ? "MULAW" : "LINEAR16";

    const body = {
      audio: { content: audioBytes },
      config: {
        encoding,
        sampleRateHertz: 8000,
        languageCode: "en-US",
        model: "telephony",
        enableAutomaticPunctuation: true
      }
    };

    const { data } = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_API_KEY}`,
      body
    );

    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || "Could not transcribe audio.";
    console.log("--> Transcription Result:", transcript);
    res.json({ transcript });
  } catch (e) {
    console.error("Error in STT endpoint:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI test server running on port ${port}`));