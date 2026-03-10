const fs = require("fs");
const https = require("https");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const Article = require("./models/Article");
const app = express();

app.use(cors());
app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* ---------- MongoDB ---------- */

mongoose.connect("mongodb://127.0.0.1:27017/articulosDB");

mongoose.connection.once("open", () => {
  console.log("MongoDB conectado");
});

/* ---------- Upload PDF ---------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

/* ---------- API ---------- */

app.post("/api/articles", upload.single("pdf"), async (req, res) => {

  try {

    const article = new Article({
      titulo: req.body.titulo,
      autores: req.body.autores,
      pdfPath: req.file.filename
    });

    await article.save();

    res.json({ success: true });

  } catch (err) {
    res.status(500).json(err);
  }

});

app.get("/api/articles", async (req, res) => {

  const articles = await Article.find().sort({ createdAt: -1 });

  res.json(articles);

});

app.delete("/api/articles/:id", async (req, res) => {

  await Article.findByIdAndDelete(req.params.id);

  res.json({ success: true });

});

/* ---------- Archivos estáticos ---------- */

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

const options = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem"))
};

https.createServer(options, app).listen(3000, () => {
  console.log("Servidor en https://localhost:3000");
});

