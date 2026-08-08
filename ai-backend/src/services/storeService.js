const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/db.json");

function ensureDbExists() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ presentations: [], payments: [] }, null, 2));
  }
}

function getDatabase() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Database read error:", err);
    return { presentations: [], payments: [] };
  }
}

function saveDatabase(db) {
  ensureDbExists();
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Database write error:", err);
  }
}

function savePresentationRecord(record) {
  const db = getDatabase();
  const newRecord = {
    id: record.id || `pres-${Date.now()}`,
    presentationTitle: record.presentationTitle || "Presentation Deck",
    transcript: record.transcript || "",
    pdfText: record.pdfText || "",
    slides: record.slides || [],
    pptUrl: record.pptUrl || "",
    pptPath: record.pptPath || "",
    transactionId: record.transactionId || null,
    payerAddress: record.payerAddress || null,
    amount: record.amount || "0.001 ALGO",
    timestamp: new Date().toISOString(),
    status: record.status || "COMPLETED",
  };

  db.presentations.unshift(newRecord);
  saveDatabase(db);
  return newRecord;
}

function getAllPresentations() {
  const db = getDatabase();
  return db.presentations;
}

function getPresentationById(id) {
  const db = getDatabase();
  return db.presentations.find(p => p.id === id) || null;
}

module.exports = {
  savePresentationRecord,
  getAllPresentations,
  getPresentationById,
};
