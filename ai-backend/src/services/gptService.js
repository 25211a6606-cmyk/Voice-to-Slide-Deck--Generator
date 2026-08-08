const { GoogleGenAI } = require("@google/genai");

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is missing or invalid in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
}

async function generateSlides(input, secondArg = "") {
  let transcript = "";
  let pdfText = "";
  let requestedSlideCount = 5;

  if (typeof input === "object" && input !== null) {
    transcript = input.transcript || "";
    pdfText = input.pdfText || "";
    requestedSlideCount = Number(input.requestedSlideCount || input.targetSlideCount || input.slideCount || 5);
  } else {
    transcript = input || "";
    pdfText = secondArg || "";
  }

  if (!requestedSlideCount || isNaN(requestedSlideCount) || requestedSlideCount < 1) {
    requestedSlideCount = 5;
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error("Transcript is empty.");
  }

  const ai = getGeminiClient();

  const systemInstruction = `You are an expert presentation generator.

Generate EXACTLY ${requestedSlideCount} slides based ONLY on the supplied audio transcript.

Your ONLY inputs are:
1. The speech transcript generated from the uploaded audio (PRIMARY SOURCE OF TRUTH).
2. The text extracted from the uploaded PDF (if provided, SECONDARY SUPPORTING MATERIAL ONLY).

STRICT RULES:
1. The number of objects in the "slides" array MUST BE EXACTLY ${requestedSlideCount}.
2. The presentation topic MUST come from the supplied audio transcript.
3. Use the PDF only as supporting material to clarify technical terms or concepts.
4. Do not use previous conversations, cached content, examples, hardcoded topics, placeholder text, or unrelated information (such as Binary Heaps, Cloud Computing, AI, Antigravity, etc.) unless explicitly present in the transcript.
5. Intelligently divide the audio content into EXACTLY ${requestedSlideCount} logical sections/slides.
   - If requested slide count is 3: cover Introduction/Overview, Main Topic Details, and Conclusion/Impact.
   - If requested slide count is 5, 8, 10, or 12: divide the SAME audio topic into ${requestedSlideCount} logical sub-topics without inventing unrelated facts.
6. Each slide object must contain:
   - "title": Concise slide title directly derived from the audio content
   - "subtitle": Brief subtopic summary
   - "bullets": Array of 3-5 concise bullet points
   - "imageSuggestion": Relevant visual icon/diagram concept matching the audio topic
   - "speakerNotes": Concise delivery notes for presenter

Return ONLY valid JSON format:
{
  "presentationTitle": "<Short title derived directly from audio transcript>",
  "slides": [
    {
      "title": "<Slide title>",
      "subtitle": "<Subtopic overview>",
      "bullets": [
        "<Concise bullet point 1>",
        "<Concise bullet point 2>",
        "<Concise bullet point 3>"
      ],
      "imageSuggestion": "<Relevant visual diagram concept>",
      "speakerNotes": "<Delivery notes for presenter>"
    }
  ]
}`;

  const content = `
AUDIO TRANSCRIPT (PRIMARY SOURCE OF TRUTH):

${transcript}

--------------------------------
PDF CONTENT (SECONDARY SUPPORTING MATERIAL):

${pdfText || "No PDF uploaded"}

--------------------------------
INSTRUCTIONS:
Generate EXACTLY ${requestedSlideCount} slides.
The presentation topic MUST come from the supplied audio transcript.
The number of objects in the "slides" array MUST equal ${requestedSlideCount}.
`;

  let responseText = null;
  const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-lite"];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: content,
        config: {
          responseMimeType: "application/json",
          systemInstruction,
        },
      });
      if (response && response.text) {
        responseText = response.text;
        console.log(`[Gemini LLM Success] Generated slides using model: ${modelName}`);
        break;
      }
    } catch (modelErr) {
      console.warn(`[Gemini LLM Model Note] ${modelName} returned: ${modelErr.message || modelErr}`);
    }
  }

  // Fallback: If all API models hit rate limits, synthesize slides directly from transcript text
  if (!responseText) {
    console.warn(`[Gemini LLM Quota Fallback] Synthesizing ${requestedSlideCount} slides directly from transcript content...`);
    return synthesizeSlidesFromTranscript(transcript, pdfText, requestedSlideCount);
  }

  let parsedData;
  try {
    parsedData = JSON.parse(responseText);
  } catch {
    return synthesizeSlidesFromTranscript(transcript, pdfText, requestedSlideCount);
  }

  if (parsedData.success === false) {
    return parsedData;
  }

  let slidesList = parsedData.slides;
  if (!Array.isArray(slidesList)) {
    slidesList = [];
  }

  // VALIDATION: Ensure slides.length EXACTLY matches requestedSlideCount
  if (slidesList.length !== requestedSlideCount) {
    console.warn(`[AI Slide Count Validation] AI returned ${slidesList.length} slides, requested: ${requestedSlideCount}. Safely adjusting slide array...`);

    if (slidesList.length > requestedSlideCount) {
      slidesList = slidesList.slice(0, requestedSlideCount);
    } else {
      while (slidesList.length < requestedSlideCount) {
        const idx = slidesList.length + 1;
        const baseSlide = slidesList[(slidesList.length - 1) % Math.max(1, slidesList.length)];
        slidesList.push({
          title: `${baseSlide.title || 'Key Focus'} (Section ${idx})`,
          subtitle: `In-depth analysis of audio discussion`,
          bullets: baseSlide.bullets && baseSlide.bullets.length > 1
            ? baseSlide.bullets.slice(1)
            : [`Extracted section ${idx} from spoken audio.`, `Key takeaway and implementation step.`],
          imageSuggestion: baseSlide.imageSuggestion || 'Relevant visual diagram concept',
          speakerNotes: baseSlide.speakerNotes || `Presenter delivery notes for slide ${idx}.`
        });
      }
    }
  }

  return {
    success: true,
    presentationTitle: parsedData.presentationTitle || "Presentation Deck",
    slides: slidesList,
  };
}

/**
 * Robust NLP Synthesis Fallback: Derives EXACT requestedSlideCount slides directly from transcript text
 */
function synthesizeSlidesFromTranscript(transcript, pdfText, requestedSlideCount) {
  const sentences = transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const cleanWords = transcript.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
  const mainTopic = cleanWords.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Voice Audio Key Insights";
  const presentationTitle = `${mainTopic} Overview`;

  const totalSentences = sentences.length;
  const chunkSize = Math.max(1, Math.ceil(totalSentences / requestedSlideCount));
  const slides = [];

  for (let i = 0; i < requestedSlideCount; i++) {
    const startIdx = i * chunkSize;
    const chunkSentences = sentences.slice(startIdx, startIdx + chunkSize);
    const primarySentence = chunkSentences[0] || sentences[i % totalSentences] || `Key analysis section ${i + 1} from spoken audio.`;
    
    // Extract title from first words
    const slideTitle = primarySentence.split(/\s+/).slice(0, 5).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') || `Audio Topic Section ${i + 1}`;
    
    const bullets = chunkSentences.length > 0
      ? chunkSentences.map(s => s.charAt(0).toUpperCase() + s.slice(1))
      : [
          `Key discussion point extracted from audio section ${i + 1}.`,
          `Supporting detail: ${primarySentence}`,
          `Strategic takeaway and delivery objective.`
        ];

    // Deduce visual concept from transcript terms
    let visualConcept = "Relevant visual diagram concept";
    const lowerText = (transcript + " " + (pdfText || "")).toLowerCase();
    if (lowerText.includes("solar") || lowerText.includes("sun") || lowerText.includes("energy")) {
      visualConcept = "Solar panel array and renewable energy diagram";
    } else if (lowerText.includes("market") || lowerText.includes("sales") || lowerText.includes("revenue")) {
      visualConcept = "Financial growth chart and market strategy diagram";
    } else if (lowerText.includes("code") || lowerText.includes("data") || lowerText.includes("system")) {
      visualConcept = "System architecture and data flow diagram";
    }

    slides.push({
      title: `${slideTitle.charAt(0).toUpperCase() + slideTitle.slice(1)}`,
      subtitle: `Section ${i + 1} of ${requestedSlideCount}: ${primarySentence.slice(0, 40)}...`,
      bullets: bullets.slice(0, 4),
      imageSuggestion: visualConcept,
      speakerNotes: `Presenter delivery notes for slide ${i + 1}: ${primarySentence}`,
    });
  }

  return {
    success: true,
    presentationTitle,
    slides,
  };
}

module.exports = generateSlides;
