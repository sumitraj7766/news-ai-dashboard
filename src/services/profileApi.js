const BASE_URL = "http://localhost:5000/api/user";

const getToken = () => localStorage.getItem("token");

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

  const data = await response.json();

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};