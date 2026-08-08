const express = require("express");
const { generateSlides } = require("../controllers/slideController");

const router = express.Router();

router.post("/generateSlides", generateSlides);

module.exports = router;
