import { useEffect, useState } from "react";
import { fetchNews } from "../services/newsApi";
import { summarizeArticle } from "../services/geminiApi";
import { saveSummaryToBackend } from "../services/summaryApi";
import Loader from "../components/Loader";
import NoArticles from "../components/NoArticles";

export default function Home({ user }) {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [category, setCategory] = useState("technology");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [saveMessage, setSaveMessage] = useState("");

  const categories = [
    "business",
    "technology",
    "sports",
    "health",
  ];

  const loadNews = async (
    selectedCategory = category,
    keyword = ""
  ) => {
    try {
      setLoading(true);
      setError("");
      setSelectedArticle(null);
      setSummary("");
      setSummaryError("");
      setSaveMessage("");

      const data = await fetchNews(
        selectedCategory,
        keyword
      );

      setArticles(data);
    } catch (err) {
      console.error("News loading error:", err);

      setError(
        err.message ||
          "Failed to load articles. Please try again."
      );

      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialNews = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchNews(
          "technology",
          ""
        );

        setArticles(data);
      } catch (err) {
        console.error(
          "Initial news loading error:",
          err
        );

        setError(
          err.message ||
            "Failed to load articles. Please try again."
        );

        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialNews();
  }, []);

  const handleCategoryClick = (selectedCategory) => {
    setCategory(selectedCategory);
    setSearch("");

    loadNews(selectedCategory, "");
  };

  const handleSearch = () => {
    loadNews(category, search);
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setSummary("");
    setSummaryError("");
    setSaveMessage("");
  };

  const handleBack = () => {
    setSelectedArticle(null);
    setSummary("");
    setSummaryError("");
    setSaveMessage("");
  };

  const handleSummarize = async () => {
    if (!selectedArticle) {
      return;
    }

    try {
      setSummaryLoading(true);
      setSummaryError("");
      setSummary("");

      const articleText = `
Title: ${selectedArticle.title}
Description: ${
        selectedArticle.description ||
        "No description available"
      }
Content: ${
        selectedArticle.content ||
        selectedArticle.description ||
        selectedArticle.title
      }
`;

      const result = await summarizeArticle(
        articleText
      );

      setSummary(result);
    } catch (err) {
      console.error(
        "Summary generation error:",
        err
      );

      setSummaryError(
        err.message ||
          "Failed to generate summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  };

  const saveSummary = async () => {
    if (!summary || !selectedArticle) {
      return;
    }

    if (!user) {
      setSaveMessage(
        "Please login before saving a summary."
      );
      return;
    }

    try {
      setSaveMessage("Saving summary...");

      await saveSummaryToBackend({
        title: selectedArticle.title,
        source:
          selectedArticle.source?.name ||
          "Unknown",
        summary,
        articleUrl: selectedArticle.url,
        imageUrl:
          selectedArticle.urlToImage || "",
        publishedAt:
          selectedArticle.publishedAt || "",
      });

      setSaveMessage(
        "Summary saved successfully!"
      );
    } catch (err) {
      console.error("Save summary error:", err);

      setSaveMessage(
        err.message ||
          "Failed to save summary."
      );
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
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      <div className="tabs">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            className={
              category === item ? "active" : ""
            }
            onClick={() =>
              handleCategoryClick(item)
            }
            disabled={loading}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && error && (
        <div className="no-articles">
          <h2>Unable to load news</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              loadNews(category, search)
            }
          >
            Try Again
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        articles.length === 0 && (
          <NoArticles />
        )}

      {!loading &&
        !error &&
        selectedArticle && (
          <div className="detail">
            <button
              type="button"
              onClick={handleBack}
            >
              ← Back
            </button>

            <img
              src={
                selectedArticle.urlToImage ||
                "https://via.placeholder.com/800"
              }
              alt={selectedArticle.title}
            />

            <h2>{selectedArticle.title}</h2>

            <p>
              <b>Source:</b>{" "}
              {selectedArticle.source?.name ||
                "Unknown"}
            </p>

            <p>
              <b>Author:</b>{" "}
              {selectedArticle.author ||
                "Unknown"}
            </p>

            <p>
              <b>Published:</b>{" "}
              {selectedArticle.publishedAt
                ? new Date(
                    selectedArticle.publishedAt
                  ).toLocaleString()
                : "Not available"}
            </p>

            <p>
              {selectedArticle.description ||
                "No description available."}
            </p>

            <p>
              {selectedArticle.content ||
                "Open the original article to read more."}
            </p>

            <div className="detail-actions">
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noreferrer"
              >
                Read Full Article
              </a>

              <button
                type="button"
                onClick={handleSummarize}
                className="summary-btn"
                disabled={summaryLoading}
              >
                {summaryLoading
                  ? "Summarising..."
                  : "Summarise"}
              </button>
            </div>

            {summaryError && (
              <p className="error-message">
                {summaryError}
              </p>
            )}

            {summary && (
              <div className="summary-box">
                <h3>AI Summary</h3>

                <div className="summary-text">
                  {summary
                    .split("\n")
                    .map((line, index) =>
                      line.trim() ? (
                        <p key={index}>
                          {line}
                        </p>
                      ) : null
                    )}
                </div>

                <button
                  type="button"
                  onClick={saveSummary}
                >
                  Save Summary
                </button>

                {saveMessage && (
                  <p className="save-message">
                    {saveMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      {!loading &&
        !error &&
        !selectedArticle && (
          <div className="articles">
            {articles.map(
              (article, index) => (
                <div
                  className="card"
                  key={
                    article.url ||
                    `${article.title}-${index}`
                  }
                  onClick={() =>
                    handleSelectArticle(article)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      handleSelectArticle(
                        article
                      );
                    }
                  }}
                >
                  <img
                    src={
                      article.urlToImage ||
                      "https://via.placeholder.com/300"
                    }
                    alt={article.title}
                  />

                  <h3>{article.title}</h3>

                  <p>
                    {article.source?.name ||
                      "Unknown source"}
                  </p>
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}