
import { fetchNews } from "../services/newsApi";
import { summarizeArticle } from "../services/geminiApi";
import Loader from "../components/Loader";
import NoArticles from "../components/NoArticles";
import { useCallback, useEffect, useState } from "react";
import { saveSummaryToBackend } from "../services/summaryApi";


export default function Home({ user }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [category, setCategory] = useState("technology");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const categories = ["business", "technology", "sports", "health"];

  const loadNews = useCallback(async () => {
  try {
    setLoading(true);
    setError("");
    setSelectedArticle(null);
    setSummary("");
    setSummaryError("");

    const data = await fetchNews(category, search);
    setArticles(data);
  } catch {
    setError("Failed to load articles. Please try again.");
    setArticles([]);
  } finally {
    setLoading(false);
  }
}, [category, search]);

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadNews();
}, [loadNews]);

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setSummary("");
    setSummaryError("");
  };

  const handleSummarize = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError("");
      setSummary("");

      const articleText = `
Title: ${selectedArticle.title}
Description: ${selectedArticle.description || "No description"}
Content: ${selectedArticle.content || selectedArticle.description || selectedArticle.title}
`;

      const result = await summarizeArticle(articleText);
      setSummary(result);
    } catch  {
      setSummaryError("Failed to generate summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const saveSummary = async () => {
  if (!summary || !selectedArticle) {
    return;
  }

  if (!user) {
    setSaveMessage("Please login before saving a summary.");
    return;
  }

  try {
    setSaveMessage("Saving summary...");

    await saveSummaryToBackend({
      title: selectedArticle.title,
      source: selectedArticle.source?.name || "Unknown",
      summary,
      articleUrl: selectedArticle.url,
      imageUrl: selectedArticle.urlToImage || "",
      publishedAt: selectedArticle.publishedAt || "",
    });

    setSaveMessage("Summary saved successfully!");
  } catch (error) {
    setSaveMessage(error.message);
  }

  setTimeout(() => {
    setSaveMessage("");
  }, 3000);
};

  return (
    <div className="container">
      <h1>Latest News</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={loadNews}>Search</button>
      </div>

      <div className="tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={category === cat ? "active" : ""}
            onClick={() => setCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <Loader />}
      {error && <h2>{error}</h2>}

      {!loading && !error && articles.length === 0 && (
        <NoArticles />
      )}

      {selectedArticle && (
        <div className="detail">
          <button onClick={() => setSelectedArticle(null)}>Back</button>

          <img
            src={selectedArticle.urlToImage || "https://via.placeholder.com/800"}
            alt={selectedArticle.title}
          />

          <h2>{selectedArticle.title}</h2>
          <p><b>Source:</b> {selectedArticle.source?.name}</p>
          <p><b>Author:</b> {selectedArticle.author || "Unknown"}</p>
          <p><b>Published:</b> {new Date(selectedArticle.publishedAt).toLocaleString()}</p>
          <p>{selectedArticle.description}</p>
          <p>{selectedArticle.content}</p>

          <a href={selectedArticle.url} target="_blank" rel="noreferrer">
            Read Full Article
          </a>

          <button onClick={handleSummarize} className="summary-btn">
            Summarise
            
          </button>
          {saveMessage && <p className="save-message">{saveMessage}</p>}

          {summaryLoading && <p>Generating summary...</p>}
          {summaryError && <p>{summaryError}</p>}

          {summary && (
            <div className="summary-box">
              <h3>AI Summary</h3>
              <p>{summary}</p>
              <button onClick={saveSummary}>Save Summary</button>
            </div>
          )}
        </div>
      )}

      {!selectedArticle && (
        <div className="articles">
          {articles.map((article, index) => (
            <div
              className="card"
              key={index}
              onClick={() => handleSelectArticle(article)}
            >
              <img
                src={article.urlToImage || "https://via.placeholder.com/300"}
                alt={article.title}
              />
              <h3>{article.title}</h3>
              <p>{article.source?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}