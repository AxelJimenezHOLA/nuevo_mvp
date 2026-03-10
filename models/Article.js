const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  titulo: String,
  autores: String,
  pdfPath: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Article", ArticleSchema);