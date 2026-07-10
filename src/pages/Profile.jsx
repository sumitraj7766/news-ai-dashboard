import { useEffect, useState } from "react";
import {
  fetchProfile,
  updateProfile,
} from "../services/profileApi";

export default function Profile({ onProfileUpdate }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchProfile();

        setProfile({
          name: data.name || "",
          email: data.email || "",
          profileImage: data.profileImage || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
  setError("Image size must be less than 1 MB.");
  return;
}

    const reader = new FileReader();

    reader.onloadend = () => {
      setProfile((previousProfile) => ({
        ...previousProfile,
        profileImage: reader.result,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = await updateProfile({
        name: profile.name,
        profileImage: profile.profileImage,
      });

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (onProfileUpdate) {
        onProfileUpdate(data.user);
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loader">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>My Profile</h1>

        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                className="profile-large-image"
              />
            ) : (
              <div className="profile-placeholder">
                {profile.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
            )}

            <label className="change-photo-btn">
              Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>

          <div className="profile-field">
            <label>Name</label>

            <input
              type="text"
              value={profile.name}
              onChange={(event) =>
                setProfile((previousProfile) => ({
                  ...previousProfile,
                  name: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="profile-field">
            <label>Email</label>

            <input
              type="email"
              value={profile.email}
              disabled
            />
          </div>

          <button
            type="submit"
            className="save-profile-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}