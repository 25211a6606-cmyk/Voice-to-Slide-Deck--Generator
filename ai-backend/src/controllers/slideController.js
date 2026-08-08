const generateSlidesWithAI = require("../services/gptService");
const PptxGenJS = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

const generatedDir = path.join(__dirname, "../generated");
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

exports.generateSlides = async (req, res) => {
  try {
    const { transcript, pdfText, requestedSlideCount, targetSlideCount, slideCount } = req.body;

    const rawCount = requestedSlideCount || targetSlideCount || slideCount || 5;
    const finalRequestedCount = Math.max(1, parseInt(rawCount, 10) || 5);

    console.log("==================================================");
    console.log(`REQUESTED SLIDE COUNT:\n${finalRequestedCount}`);
    console.log("--------------------------------------------------");
    console.log(`AUDIO TRANSCRIPT:\n${transcript || "NO TRANSCRIPT PROVIDED"}`);
    console.log("--------------------------------------------------");
    console.log(`PDF CONTENT:\n${pdfText || "No PDF content"}`);
    console.log("==================================================");

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Transcript is required",
      });
    }

    const slidesData = await generateSlidesWithAI({
      transcript,
      pdfText,
      requestedSlideCount: finalRequestedCount,
    });

    let slidesList = slidesData.slides;
    if (!Array.isArray(slidesList)) {
      throw new Error("AI did not return a valid slides array.");
    }

    // Strict validation: slides count MUST match requested count
    if (slidesList.length !== finalRequestedCount) {
      console.warn(`[Slide Controller Validation] Adjusting slides array length from ${slidesList.length} to ${finalRequestedCount}`);
      if (slidesList.length > finalRequestedCount) {
        slidesList = slidesList.slice(0, finalRequestedCount);
      } else {
        while (slidesList.length < finalRequestedCount) {
          const idx = slidesList.length + 1;
          const baseSlide = slidesList[(slidesList.length - 1) % Math.max(1, slidesList.length)];
          slidesList.push({
            title: `${baseSlide.title || 'Topic Focus'} (Section ${idx})`,
            subtitle: `Detailed analysis of audio discussion`,
            bullets: baseSlide.bullets && baseSlide.bullets.length > 1
              ? baseSlide.bullets.slice(1)
              : [`Extracted topic section ${idx} from spoken audio.`, `Key takeaway and delivery note.`],
            imageSuggestion: baseSlide.imageSuggestion || 'Relevant visual diagram concept',
            speakerNotes: baseSlide.speakerNotes || `Presenter notes for section ${idx}.`
          });
        }
      }
    }

    console.log("--------------------------------------------------");
    console.log(`AI SLIDE COUNT:\n${slidesList.length}`);
    console.log("==================================================");

    const presentationTitle = slidesData.presentationTitle || "Presentation Deck";

    // Generate PPTX File using pptxgenjs - Dynamically create 1 PPT slide for EVERY object in slides array
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";

    let pptSlidesCreated = 0;

    for (let i = 0; i < slidesList.length; i++) {
      const s = slidesList[i];
      const slide = pptx.addSlide();
      pptSlidesCreated++;

      slide.background = { color: "0F172A" }; // Deep slate dark mode

      if (i === 0) {
        // Slide 1: Primary Title & Overview Slide
        slide.addText(presentationTitle.toUpperCase(), {
          x: 0.8,
          y: 1.0,
          w: 11.3,
          h: 1.0,
          fontSize: 28,
          bold: true,
          color: "A7F3D0", // Emerald accent
        });

        slide.addText(s.title || "Executive Summary", {
          x: 0.8,
          y: 2.2,
          w: 11.3,
          h: 0.6,
          fontSize: 22,
          bold: true,
          color: "38BDF8", // Cyan accent
        });

        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: 0.8,
            y: 2.8,
            w: 11.3,
            h: 0.4,
            fontSize: 14,
            italic: true,
            color: "94A3B8",
          });
        }

        const bulletsText = (s.bullets || []).map((b) => `• ${b}`).join("\n\n");
        slide.addText(bulletsText, {
          x: 0.8,
          y: s.subtitle ? 3.3 : 3.0,
          w: 11.3,
          h: 3.0,
          fontSize: 14,
          color: "F1F5F9",
          lineSpacing: 20,
        });

      } else {
        // Slide 2 to N: Section Content Slides
        slide.addText(s.title || `Slide ${i + 1}`, {
          x: 0.8,
          y: 0.6,
          w: 11.3,
          h: 0.6,
          fontSize: 24,
          bold: true,
          color: "38BDF8",
        });

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

        const bulletsText = (s.bullets || []).map((b) => `• ${b}`).join("\n\n");
        slide.addText(bulletsText, {
          x: 0.8,
          y: s.subtitle ? 1.7 : 1.4,
          w: 11.3,
          h: 4.2,
          fontSize: 15,
          color: "F1F5F9",
          lineSpacing: 22,
        });
      }

      // Visual suggestion icon badge
      if (s.imageSuggestion) {
        slide.addText(`💡 Visual Suggestion: ${s.imageSuggestion}`, {
          x: 0.8,
          y: 6.3,
          w: 11.3,
          h: 0.4,
          fontSize: 11,
          italic: true,
          color: "A7F3D0",
        });
      }

      // Speaker Notes
      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }
    }

    const fileName = `Presentation-${Date.now()}.pptx`;
    const filePath = path.join(generatedDir, fileName);
    await pptx.writeFile({ fileName: filePath });

    console.log("--------------------------------------------------");
    console.log(`PPT SLIDES CREATED:\n${pptSlidesCreated}`);
    console.log("--------------------------------------------------");
    console.log(`PPT FILE:\n${filePath}`);
    console.log("==================================================");

    const pptUrl = `http://localhost:${process.env.PORT || 5000}/generated/${fileName}`;

    res.json({
      success: true,
      presentationTitle,
      slides: slidesList,
      pptUrl,
    });

  } catch (error) {
    console.error("Slide Controller Error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};
