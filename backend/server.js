const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "audio/mpeg" || file.mimetype === "audio/mp3") {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers MP3 sont acceptés"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10MB
  },
});

// Route pour le téléchargement et le traitement des fichiers
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Aucun fichier n'a été téléchargé" });
    }

    const filePath = path.join(__dirname, req.file.path);

    // Appeler le script Python
    const pythonProcess = spawn("python", ["app.py", filePath]);

    let srtContent = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      srtContent += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        // Créer le fichier SRT
        const srtFilePath = filePath.replace(".mp3", ".srt");
        fs.writeFileSync(srtFilePath, srtContent);

        // Envoyer le contenu SRT au frontend
        res.json({
          success: true,
          srt_content: srtContent,
          message: "Fichier SRT généré avec succès",
        });

        // Nettoyer les fichiers temporaires
        fs.unlink(filePath, (err) => {
          if (err)
            console.error("Erreur lors de la suppression du fichier MP3:", err);
        });
      } else {
        console.error("Erreur Python:", errorOutput);
        res.status(500).json({
          error: "Erreur lors de la conversion en SRT",
          details: errorOutput,
        });
      }
    });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    res.status(500).json({ error: "Erreur lors du traitement du fichier" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
