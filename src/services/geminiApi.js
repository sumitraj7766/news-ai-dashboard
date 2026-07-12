const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

export const summarizeArticle = async (articleText) => {
  const response = await fetch(
    `${BACKEND_URL}/api/ai/summarize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleText }),
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Backend error: ${response.status}`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to generate summary"
    );
  }

  return data.summary;
};