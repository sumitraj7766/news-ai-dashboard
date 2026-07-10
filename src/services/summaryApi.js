const BASE_URL = "http://localhost:5000/api/user";

const getToken = () => localStorage.getItem("token");

export const saveSummaryToBackend = async (summaryData) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login before saving a summary.");
  }

  const response = await fetch(`${BASE_URL}/save-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(summaryData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save summary");
  }

  return data;
};

export const fetchSummariesFromBackend = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view summaries.");
  }

  const response = await fetch(`${BASE_URL}/summaries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch summaries");
  }

  return data;
};

export const deleteSummaryFromBackend = async (summaryId) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to delete a summary.");
  }

  const response = await fetch(
    `${BASE_URL}/summaries/${summaryId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete summary");
  }

  return data;
};