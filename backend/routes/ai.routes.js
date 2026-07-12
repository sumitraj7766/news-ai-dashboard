const express = require("express");

const router = express.Router();

router.post("/summarize", async (req, res) => {
  try {
    const { articleText } = req.body;

    if (!articleText?.trim()) {
      return res.status(400).json({
        message: "Article text is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured",
      });
    }

    const prompt = `
Summarize the following news article into exactly 3 concise bullet points.
Keep the language simple and factual.

${articleText}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return res.status(response.status).json({
        message:
          data?.error?.message ||
          "Failed to generate summary",
      });
    }

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      return res.status(500).json({
        message: "No summary returned by Gemini",
      });
    }

    return res.json({ summary });
  } catch (error) {
    console.error("Summarize error:", error.message);

    return res.status(500).json({
      message: "Failed to generate summary",
    });
  }
});

module.exports = router;