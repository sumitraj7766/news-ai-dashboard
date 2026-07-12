const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const BASE_URL = `${BACKEND_URL}/api/user`;

const getToken = () => localStorage.getItem("token");

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await response.text();

    console.error("Profile API non-JSON response:", text);

    throw new Error(
      `Backend error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const fetchProfile = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to view your profile.");
  }

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
};

export const updateProfile = async (profileData) => {
  const token = getToken();

  if (!token) {
    throw new Error("Please login to update your profile.");
  }

  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};