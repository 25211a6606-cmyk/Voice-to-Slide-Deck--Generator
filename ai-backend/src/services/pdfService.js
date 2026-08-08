const fs = require("fs");
const pdf = require("pdf-parse");

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text ? data.text.trim() : "";
  } catch (error) {
    console.error("PDF Parsing Error:", error.message || error);
    return "";
  }
}

module.exports = extractTextFromPDF;
