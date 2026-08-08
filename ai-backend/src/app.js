const express = require("express");
const cors = require("cors");
const path = require("path");

const uploadRoutes = require("./routes/uploadRoutes");
const slideRoutes = require("./routes/slideRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static generated PPTX files with CORS & Attachment disposition headers
app.use(
  "/generated",
  express.static(path.join(__dirname, "generated"), {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(filePath)}"`
      );
    },
  })
);

// Routes
app.use("/api", uploadRoutes);
app.use("/api", slideRoutes);

app.get("/", (req, res) => {
  res.send("AI Backend Running 🚀");
});

module.exports = app;
