const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const cors = require("cors");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
    res.send("Server running ✅");
});

app.post("/convert", upload.single("video"), (req, res) => {
    console.log("📥 Requête reçue");

    if (!req.file) {
        console.log("❌ Aucun fichier reçu");
        return res.status(400).send("No file uploaded");
    }

    const inputPath = req.file.path;
    const outputPath = inputPath + ".mp4";

    console.log("📂 Input:", inputPath);

    ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec("libx264")
        .format("mp4")
        .on("start", (cmd) => {
            console.log("🚀 FFmpeg start:", cmd);
        })
        .on("end", () => {
            console.log("✅ Conversion terminée");

            res.download(outputPath, "video.mp4", () => {
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        })
        .on("error", (err) => {
            console.error("❌ ERREUR FFMPEG:", err.message);
            res.status(500).send("Conversion error");
        })
        .run();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
