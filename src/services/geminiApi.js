const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const summarizeArticle = async (text) => {
  if (!GEMINI_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Summarize the following news article in exactly 3 short bullet points.

Article:

${text}

Return only 3 bullet points.`,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  console.log("Gemini Response:", data);

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Failed to generate AI summary"
    );
  }

  const summary =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary");
  }

  return summary;
};