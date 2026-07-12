const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const BASE_URL = `${BACKEND_URL}/api/user`;

const getToken = () => localStorage.getItem("token");

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON backend response:", text);

    throw new Error(
      `Backend error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

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

  const data = await parseResponse(response);

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

  const data = await parseResponse(response);

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

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete summary");
  }

  return data;
};