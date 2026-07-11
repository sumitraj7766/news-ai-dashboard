const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = req.query.category || "technology";
    const search = req.query.search || "";

    let url;

    if (search) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        search
      )}&language=en&apiKey=${process.env.NEWS_API_KEY}`;
    } else {
      url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch news",
    });
  }
});

module.exports = router;