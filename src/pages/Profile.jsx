import { useEffect, useMemo, useState } from "react";
import {
  fetchProfile,
  updateProfile,
} from "../services/profileApi";
import { fetchSummariesFromBackend } from "../services/summaryApi";

const emptyProfile = {
  name: "",
  email: "",
  profileImage: "",
  bio: "",
  location: "",
  college: "",
  branch: "",
  skills: [],
  github: "",
  linkedin: "",
  portfolio: "",
  createdAt: "",
};

export default function Profile({ onProfileUpdate }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [skillsInput, setSkillsInput] = useState("");
  const [summaryCount, setSummaryCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, summaries] = await Promise.all([
          fetchProfile(),
          fetchSummariesFromBackend(),
        ]);

        const normalizedProfile = {
          ...emptyProfile,
          ...profileData,
          skills: Array.isArray(profileData.skills)
            ? profileData.skills
            : [],
        };

        setProfile(normalizedProfile);
        setSkillsInput(
          normalizedProfile.skills.join(", ")
        );
        setSummaryCount(
          Array.isArray(summaries) ? summaries.length : 0
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const joinedDate = useMemo(() => {
    if (!profile.createdAt) {
      return "Not available";
    }

    return new Date(profile.createdAt).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }, [profile.createdAt]);

  const updateField = (field, value) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [field]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 500;
        let width = image.width;
        let height = image.height;

        if (width > height && width > maxSize) {
          height = Math.round(
            (height * maxSize) / width
          );
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(
            (width * maxSize) / height
          );
          height = maxSize;
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          setError("Unable to process image.");
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        );

        const compressedImage =
          canvas.toDataURL("image/jpeg", 0.75);

        updateField(
          "profileImage",
          compressedImage
        );

        setError("");
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const parsedSkills = skillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await updateProfile({
        name: profile.name,
        profileImage: profile.profileImage,
        bio: profile.bio,
        location: profile.location,
        college: profile.college,
        branch: profile.branch,
        skills: parsedSkills,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
      });

      setProfile((previousProfile) => ({
        ...previousProfile,
        ...response.user,
        skills: response.user.skills || [],
      }));

      setSkillsInput(
        (response.user.skills || []).join(", ")
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      onProfileUpdate?.(response.user);

      setMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openExternalLink = (url) => {
    if (!url) {
      return;
    }

    const finalUrl = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    window.open(
      finalUrl,
      "_blank",
      "noopener,noreferrer"
    );
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
    <main className="professional-profile-page">
      <section className="profile-hero-card">
        <div className="profile-cover" />

        <div className="profile-hero-content">
          <div className="profile-avatar-wrapper">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name || "Profile"}
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {profile.name
                  ? profile.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>
            )}

            {isEditing && (
              <label className="profile-camera-button">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </label>
            )}
          </div>

          <div className="profile-heading">
            <div>
              <h1>
                {profile.name || "User Profile"}
              </h1>

              <p className="profile-tagline">
                {profile.bio ||
                  "Add a short professional bio to introduce yourself."}
              </p>

              <div className="profile-meta-line">
                <span>
                  📍{" "}
                  {profile.location ||
                    "Location not added"}
                </span>

                <span>
                  🎓{" "}
                  {profile.college ||
                    "College not added"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={
                isEditing
                  ? "profile-cancel-button"
                  : "profile-edit-button"
              }
              onClick={() =>
                setIsEditing((current) => !current)
              }
            >
              {isEditing
                ? "Cancel Editing"
                : "Edit Profile"}
            </button>
          </div>
        </div>
      </section>

      <section className="profile-stats-grid">
        <div className="profile-stat-card">
          <strong>{summaryCount}</strong>
          <span>Saved Summaries</span>
        </div>

        <div className="profile-stat-card">
          <strong>
            {profile.skills.length}
          </strong>
          <span>Skills Added</span>
        </div>

        <div className="profile-stat-card">
          <strong>{joinedDate}</strong>
          <span>Joined</span>
        </div>
      </section>

      <section className="profile-content-grid">
        <div className="profile-main-column">
          <article className="profile-section-card">
            <div className="profile-section-heading">
              <h2>About</h2>
            </div>

            {isEditing ? (
              <textarea
                className="profile-textarea"
                placeholder="Write a short professional bio..."
                value={profile.bio}
                maxLength={300}
                onChange={(event) =>
                  updateField(
                    "bio",
                    event.target.value
                  )
                }
              />
            ) : (
              <p className="profile-about-text">
                {profile.bio ||
                  "No bio added yet."}
              </p>
            )}
          </article>

          <article className="profile-section-card">
            <div className="profile-section-heading">
              <h2>Education & Details</h2>
            </div>

            <div className="profile-fields-grid">
              <ProfileField
                label="Full Name"
                value={profile.name}
                editing={isEditing}
                onChange={(value) =>
                  updateField("name", value)
                }
              />

              <ProfileField
                label="Email"
                value={profile.email}
                editing={false}
              />

              <ProfileField
                label="College"
                value={profile.college}
                editing={isEditing}
                onChange={(value) =>
                  updateField("college", value)
                }
              />

              <ProfileField
                label="Branch"
                value={profile.branch}
                editing={isEditing}
                onChange={(value) =>
                  updateField("branch", value)
                }
              />

              <ProfileField
                label="Location"
                value={profile.location}
                editing={isEditing}
                onChange={(value) =>
                  updateField("location", value)
                }
              />

              <ProfileField
                label="Joined"
                value={joinedDate}
                editing={false}
              />
            </div>
          </article>

          <article className="profile-section-card">
            <div className="profile-section-heading">
              <h2>Skills</h2>
            </div>

            {isEditing ? (
              <>
                <input
                  className="profile-input"
                  type="text"
                  placeholder="Python, React, Node.js, MongoDB"
                  value={skillsInput}
                  onChange={(event) =>
                    setSkillsInput(
                      event.target.value
                    )
                  }
                />

                <p className="profile-help-text">
                  Separate skills using commas.
                </p>
              </>
            ) : profile.skills.length > 0 ? (
              <div className="profile-skills-list">
                {profile.skills.map((skill) => (
                  <span
                    className="profile-skill-chip"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="profile-muted-text">
                No skills added yet.
              </p>
            )}
          </article>
        </div>

        <aside className="profile-side-column">
          <article className="profile-section-card">
            <div className="profile-section-heading">
              <h2>Contact</h2>
            </div>

            <div className="profile-contact-list">
              <div>
                <span>Email</span>
                <strong>
                  {profile.email ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {profile.location ||
                    "Not added"}
                </strong>
              </div>
            </div>
          </article>

          <article className="profile-section-card">
            <div className="profile-section-heading">
              <h2>Professional Links</h2>
            </div>

            {isEditing ? (
              <div className="profile-links-form">
                <ProfileField
                  label="GitHub"
                  value={profile.github}
                  editing
                  placeholder="github.com/username"
                  onChange={(value) =>
                    updateField("github", value)
                  }
                />

                <ProfileField
                  label="LinkedIn"
                  value={profile.linkedin}
                  editing
                  placeholder="linkedin.com/in/username"
                  onChange={(value) =>
                    updateField(
                      "linkedin",
                      value
                    )
                  }
                />

                <ProfileField
                  label="Portfolio"
                  value={profile.portfolio}
                  editing
                  placeholder="yourportfolio.com"
                  onChange={(value) =>
                    updateField(
                      "portfolio",
                      value
                    )
                  }
                />
              </div>
            ) : (
              <div className="profile-social-buttons">
                <button
                  type="button"
                  disabled={!profile.github}
                  onClick={() =>
                    openExternalLink(
                      profile.github
                    )
                  }
                >
                  GitHub
                </button>

                <button
                  type="button"
                  disabled={!profile.linkedin}
                  onClick={() =>
                    openExternalLink(
                      profile.linkedin
                    )
                  }
                >
                  LinkedIn
                </button>

                <button
                  type="button"
                  disabled={!profile.portfolio}
                  onClick={() =>
                    openExternalLink(
                      profile.portfolio
                    )
                  }
                >
                  Portfolio
                </button>
              </div>
            )}
          </article>

          {isEditing && (
            <button
              type="button"
              className="profile-save-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving Profile..."
                : "Save Changes"}
            </button>
          )}

          {message && (
            <p className="profile-success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="profile-error-message">
              {error}
            </p>
          )}
        </aside>
      </section>
    </main>
  );
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  placeholder = "",
}) {
  return (
    <div className="professional-profile-field">
      <label>{label}</label>

      {editing ? (
        <input
          className="profile-input"
          type="text"
          value={value || ""}
          placeholder={placeholder}
          onChange={(event) =>
            onChange?.(event.target.value)
          }
        />
      ) : (
        <p>{value || "Not added"}</p>
      )}
    </div>
  );
}