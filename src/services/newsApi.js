const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

export const fetchNews = async (
  category = "technology",
  search = ""
) => {
  const params = new URLSearchParams({
    category,
    search: search.trim(),
  });

  const response = await fetch(
    `${BACKEND_URL}/api/news?${params.toString()}`
  );
  console.log(
  "Production backend URL:",
  import.meta.env.VITE_BACKEND_URL
);

  const data = await response.json();

  if (!response.ok || data.status === "error") {
    throw new Error(
      data.message || "Failed to load articles"
    );
  }


  return data.articles || [];
};