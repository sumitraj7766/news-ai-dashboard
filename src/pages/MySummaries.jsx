import { useEffect, useState } from "react";

import {
  fetchSummariesFromBackend,
  deleteSummaryFromBackend,
} from "../services/summaryApi";

export default function MySummaries() {
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    const loadSummaries = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchSummariesFromBackend();

        setSavedSummaries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummaries();
  }, []);

  const handleDelete = async (summaryId) => {
    try {
      setError("");
      setDeleteMessage("");

      await deleteSummaryFromBackend(summaryId);

      setSavedSummaries((previousSummaries) =>
        previousSummaries.filter(
          (summary) => summary._id !== summaryId
        )
      );

      if (selectedSummary?._id === summaryId) {
        setSelectedSummary(null);
      }

      setDeleteMessage("Summary deleted successfully.");

      setTimeout(() => {
        setDeleteMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loader">
          Loading saved summaries...
        </div>
      </div>
    );
  }

  if (selectedSummary) {
    return (
      <div className="container">
        <div className="summary-detail">
          <button
            className="back-btn"
            onClick={() => setSelectedSummary(null)}
          >
            ← Back
          </button>

          {selectedSummary.imageUrl && (
            <img
              src={selectedSummary.imageUrl}
              alt={selectedSummary.title}
              className="summary-detail-image"
            />
          )}

          <h1>{selectedSummary.title}</h1>

          <p className="summary-source">
            <b>Source:</b> {selectedSummary.source}
          </p>

          <p className="saved-date">
            <b>Published:</b>{" "}
            {selectedSummary.publishedAt
              ? new Date(
                  selectedSummary.publishedAt
                ).toLocaleString()
              : "Not available"}
          </p>

          <p className="saved-date">
            <b>Saved:</b>{" "}
            {new Date(
              selectedSummary.createdAt
            ).toLocaleString()}
          </p>

          <div className="summary-box">
            <h2>AI Summary</h2>

            <div className="saved-summary-text">
              {selectedSummary.summary
                .split("\n")
                .map((line, index) =>
                  line.trim() ? (
                    <p key={index}>{line}</p>
                  ) : null
                )}
            </div>
          </div>

          <div className="summary-actions">
            <a
              href={selectedSummary.articleUrl}
              target="_blank"
              rel="noreferrer"
              className="read-article-btn"
            >
              Read Original Article
            </a>

            <button
              className="delete-btn"
              onClick={() =>
                handleDelete(selectedSummary._id)
              }
            >
              Delete Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>My Summaries</h1>

      {deleteMessage && (
        <p className="save-message">
          {deleteMessage}
        </p>
      )}

      {error && (
        <div className="no-articles">
          <h2>Something went wrong</h2>
          <p>{error}</p>
        </div>
      )}

      {!error && savedSummaries.length === 0 ? (
        <div className="no-articles">
          <h2>No saved summaries yet</h2>

          <p>
            Generate and save an AI summary first.
          </p>
        </div>
      ) : (
        !error && (
          <div className="summary-grid">
            {savedSummaries.map((item) => (
              <div
                className="saved-summary-card"
                key={item._id}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="saved-summary-image"
                  />
                )}

                <h3>{item.title}</h3>

                <p className="summary-source">
                  {item.source}
                </p>

                <div className="summary-preview">
                  <p>
                    {item.summary.length > 180
                      ? `${item.summary.slice(
                          0,
                          180
                        )}...`
                      : item.summary}
                  </p>
                </div>

                <small>
                  Saved:{" "}
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </small>

                <div className="summary-actions">
                  <button
                    className="view-details-btn"
                    onClick={() =>
                      setSelectedSummary(item)
                    }
                  >
                    View Details
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(item._id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}