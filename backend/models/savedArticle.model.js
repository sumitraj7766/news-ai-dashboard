const mongoose = require("mongoose");

const savedArticleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      default: "Unknown",
    },

    summary: {
      type: String,
      required: true,
    },

    articleUrl: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const SavedArticle = mongoose.model(
  "SavedArticle",
  savedArticleSchema
);

module.exports = SavedArticle;