const path = require("path");
const transcribeAudio = require("../services/transcribeService");
const generateSlides = require("../services/gptService");
const extractPdfText = require("../services/pdfService");
const { savePresentationRecord } = require("../services/storeService");
const PptxGenJS = require("pptxgenjs");
const fs = require("fs");

const generatedDir = path.join(__dirname, "../generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

exports.uploadAudio = async (req, res) => {
  try {
    const audioFile = req.file || (req.files?.audio && req.files.audio[0]);

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        message: "No audio uploaded",
      });
    }

    const audioPath = audioFile.path || path.join(__dirname, "../uploads", audioFile.filename);

    const transcript = await transcribeAudio(audioPath);

    console.log("===== TRANSCRIPT =====");
    console.log(transcript);

    let pdfText = "";

    if (req.files?.pdf) {
      pdfText = await extractPdfText(req.files.pdf[0].path);
    }

    const slideData = await generateSlides({
      transcript,
      pdfText,
    });

    if (slideData.success === false) {
      return res.status(400).json({
        success: false,
        message: slideData.message || "No valid speech detected.",
      });
    }

    const slidesList = slideData.slides || [];
    const presentationTitle = slideData.presentationTitle || "Presentation Deck";

    // Step 3: Generate Unique PPTX File
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    // Title Cover Slide
    const coverSlide = pptx.addSlide();
    coverSlide.background = { color: "0F172A" };
    coverSlide.addText(presentationTitle, {
      x: 1.0,
      y: 2.2,
      w: 11.3,
      h: 1.5,
      fontSize: 32,
      bold: true,
      color: "8B5CF6",
      align: "left",
    });

    // Content Slides
    slidesList.forEach((s) => {
      const slide = pptx.addSlide();
      slide.background = { color: "0F172A" };

      // Title
      slide.addText(s.title || "Slide Title", {
        x: 0.8,
        y: 0.6,
        w: 11.3,
        h: 0.6,
        fontSize: 24,
        bold: true,
        color: "38BDF8",
      });

      // Subtitle if present
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: 1.2,
          w: 11.3,
          h: 0.4,
          fontSize: 14,
          italic: true,
          color: "94A3B8",
        });
      }

      // Bullets
      const bulletsText = (s.bullets || []).map((b) => `• ${b}`).join("\n\n");
      slide.addText(bulletsText, {
        x: 0.8,
        y: s.subtitle ? 1.7 : 1.4,
        w: 11.3,
        h: 3.8,
        fontSize: 15,
        color: "F1F5F9",
        lineSpacing: 22,
      });

      // Image Suggestion Badge at bottom
      if (s.imageSuggestion) {
        slide.addText(`💡 Visual Suggestion: ${s.imageSuggestion}`, {
          x: 0.8,
          y: 6.2,
          w: 11.3,
          h: 0.4,
          fontSize: 11,
          italic: true,
          color: "A7F3D0",
        });
      }

      // Speaker Delivery Notes
      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }
    });

    const timestamp = Date.now();
    const fileName = `Presentation-${timestamp}.pptx`;
    const pptxPath = path.join(generatedDir, fileName);
    await pptx.writeFile({ fileName: pptxPath });

    const pptUrl = `http://localhost:${process.env.PORT || 5000}/generated/${fileName}`;

    // Extract TxID and Payer Address if header present
    const transactionId = req.headers["x-payment-proof"] || req.headers["x-402-payment"] || null;
    const payerAddress = req.headers["x-payer-address"] || "ZDZ4KU5CGG5FAHDALMMGJ27AN6BQ7CGTZV5HY2P5EGFHHHUFLDSRJHZZDE";

    // Save record to persistent DB
    const savedRecord = savePresentationRecord({
      id: `pres-${timestamp}`,
      presentationTitle,
      transcript,
      pdfText,
      slides: slidesList,
      pptUrl,
      pptPath: pptxPath,
      transactionId,
      payerAddress,
      amount: "0.001 ALGO",
      status: "VERIFIED_AND_COMPLETED",
    });

    res.json({
      success: true,
      id: savedRecord.id,
      presentationTitle,
      transcript,
      pdfText,
      slides: slidesList,
      pptUrl,
      transactionId,
      payerAddress,
      timestamp: savedRecord.timestamp,
    });
  } catch (err) {
    console.error("Upload Controller Error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};
