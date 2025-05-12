const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

    // Ici, vous pouvez ajouter la logique pour appeler le script Python
    // Pour l'instant, nous renvoyons juste un succès
    res.json({
      success: true,
      message: "Fichier reçu avec succès",
      filePath: filePath,
    });
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    res.status(500).json({ error: "Erreur lors du traitement du fichier" });
  }
});

// Nettoyage des fichiers temporaires
app.use((req, res, next) => {
  res.on("finish", () => {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error("Erreur lors de la suppression du fichier:", err);
      });
    }
  });
  next();
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
