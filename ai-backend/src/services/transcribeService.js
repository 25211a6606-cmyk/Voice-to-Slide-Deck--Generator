const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is missing or invalid in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp3":
      return "audio/mp3";
    case ".wav":
      return "audio/wav";
    case ".m4a":
      return "audio/m4a";
    case ".aac":
      return "audio/aac";
    case ".ogg":
      return "audio/ogg";
    case ".flac":
      return "audio/flac";
    case ".webm":
      return "audio/webm";
    default:
      return "audio/wav";
  }
}

async function transcribeAudio(filePath) {
  const ai = getGeminiClient();
  const audioBuffer = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        inlineData: {
          mimeType,
          data: audioBuffer.toString("base64"),
        },
      },
      "Transcribe this spoken voice audio file verbatim into clean, accurate English text. Return ONLY the transcribed text without extra markdown formatting or assumptions.",
    ],
  });

  if (!response.text || response.text.trim().length === 0) {
    throw new Error("Gemini returned an empty audio transcription response.");
  }

  return response.text.trim();
}

module.exports = transcribeAudio;
