const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Detect route
app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(imagePath));

    const response = await axios.post(
      "http://127.0.0.1:8000/detect",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image");
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));