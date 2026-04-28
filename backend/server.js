require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data"); // ✅ IMPORTANT FIX

const app = express();
app.use(cors());
app.use(express.json());

// 📁 Multer (store file in memory)
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   🗄️ MongoDB Connection
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

/* =========================
   🧾 Schema
========================= */
const DetectionSchema = new mongoose.Schema({
  filename: String,
  total_defects: Number,
  detections: Array,
  timestamp: { type: Date, default: Date.now },
});

const Detection = mongoose.model("Detection", DetectionSchema);

/* =========================
   🔍 DETECT ROUTE
========================= */
app.post("/api/detect", upload.single("file"), async (req, res) => {
  try {
    // ❗ Safety check
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 📦 Create FormData
    const formData = new FormData();

    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // 🔗 Call AI service
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/detect`,
      formData,
      {
        headers: formData.getHeaders(), // ✅ IMPORTANT
      }
    );

    const data = response.data;

    // 💾 Save to MongoDB
    await Detection.create({
      filename: req.file.originalname,
      total_defects: data.total_defects,
      detections: data.detections,
    });

    // 🔁 Send response to frontend
    res.json(data);

  } catch (err) {
    console.error("Detection Error:", err.message);
    res.status(500).json({ error: "Detection failed" });
  }
});

/* =========================
   📊 HISTORY ROUTE
========================= */
app.get("/api/history", async (req, res) => {
  try {
    const history = await Detection.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});