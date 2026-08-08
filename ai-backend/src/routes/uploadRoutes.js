const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadAudio } = require("../controllers/uploadController");
const { generateSlides } = require("../controllers/slideController");

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const multiUpload = upload.fields([
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

// POST /api/upload & POST /api/transcribe
router.post("/upload", multiUpload, uploadAudio);
router.post("/transcribe", multiUpload, uploadAudio);

// POST /api/generateSlides
router.post("/generateSlides", generateSlides);

module.exports = router;
