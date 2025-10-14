const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

async function main() {
  const text =
    "Hello! This is a test using the u-law audio format. " +
    "If you can hear this, the format is working correctly.";
  const body = {
    input: { text },
    voice: { languageCode: "en-US", name: "en-US-Wavenet-F" },
    // Change the encoding to MULAW and ensure sample rate is 8000
    //audioConfig: { audioEncoding: "MULAW", sampleRateHertz: 8000 },
    audioConfig: { audioEncoding: "LINEAR16", sampleRateHertz: 8000 },
  };

  const { data } = await axios.post(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_API_KEY}`,
    body
  );
  const audio = Buffer.from(data.audioContent, "base64");
  // Change the output filename to .ulaw
  // fs.writeFileSync("test_tts.ulaw", audio);
  // console.log("✅ Created test_tts.ulaw");
   fs.writeFileSync("test_tts.wav", audio);
  console.log("✅ Created test_tts.wav");
}
main();