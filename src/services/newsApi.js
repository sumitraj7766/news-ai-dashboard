const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

console.log("Using backend URL:", BACKEND_URL);

export const fetchNews = async (
  category = "technology",
  search = ""
) => {
  const params = new URLSearchParams({
    category,
    search: search.trim(),
  });

  const requestUrl =
    `${BACKEND_URL}/api/news?${params.toString()}`;

  console.log("News request URL:", requestUrl);

  const response = await fetch(requestUrl);

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(
      data.message || "Failed to load articles"
    );
  }

  return data.articles || [];
};