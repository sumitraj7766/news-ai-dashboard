const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category =
      req.query.category || "technology";

    const search =
      req.query.search?.trim() || "";

    const apiKey =
      process.env.NEWS_API_KEY;

    const params = new URLSearchParams({
      apiKey,
      language: "en",
    });

    let endpoint;

    if (search) {
      endpoint = "everything";
      params.set("q", search);
    } else {
      endpoint = "top-headlines";
      params.set("country", "us");
      params.set("category", category);
    }

    const response = await fetch(
      `https://newsapi.org/v2/${endpoint}?${params.toString()}`
    );

    const data = await response.json();

    if (
      !response.ok ||
      data.status === "error"
    ) {
      return res
        .status(response.status || 500)
        .json({
          message:
            data.message ||
            "Failed to fetch news",
        });
    }

    return res.json({
      articles: data.articles || [],
    });
  } catch (error) {
    console.error(
      "News fetch error:",
      error.message
    );

    return res.status(500).json({
      message: "Failed to fetch news",
    });
  }
});

module.exports = router;