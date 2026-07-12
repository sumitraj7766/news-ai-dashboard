const express = require("express");
const jwt = require("jsonwebtoken");
const SavedArticle = require("../models/savedArticle.model");
const User = require("../models/user.model");

const router = express.Router();

console.log("User routes loaded");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

router.post(
  "/save-summary",
  protect,
  async (req, res) => {
    try {
      const {
        title,
        source,
        summary,
        articleUrl,
        imageUrl,
        publishedAt,
      } = req.body;

      if (!title || !summary || !articleUrl) {
        return res.status(400).json({
          message:
            "Title, summary and article URL are required",
        });
      }

      const savedArticle =
        await SavedArticle.create({
          userId: req.userId,
          title,
          source: source || "Unknown",
          summary,
          articleUrl,
          imageUrl: imageUrl || "",
          publishedAt: publishedAt || "",
        });

      return res.status(201).json({
        message: "Summary saved successfully",
        savedArticle,
      });
    } catch (error) {
      console.error(
        "Save summary error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to save summary",
      });
    }
  }
);

router.get(
  "/summaries",
  protect,
  async (req, res) => {
    try {
      const summaries =
        await SavedArticle.find({
          userId: req.userId,
        }).sort({
          createdAt: -1,
        });

      return res.json(summaries);
    } catch (error) {
      console.error(
        "Fetch summaries error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to fetch summaries",
      });
    }
  }
);

router.delete(
  "/summaries/:id",
  protect,
  async (req, res) => {
    try {
      const summary =
        await SavedArticle.findOne({
          _id: req.params.id,
          userId: req.userId,
        });

      if (!summary) {
        return res.status(404).json({
          message: "Summary not found",
        });
      }

      await SavedArticle.deleteOne({
        _id: req.params.id,
        userId: req.userId,
      });

      return res.json({
        message: "Summary deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete summary error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to delete summary",
      });
    }
  }
);

router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      profileImage,
      bio,
      location,
      college,
      branch,
      skills,
      github,
      linkedin,
      portfolio,
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      user.name = trimmedName;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (college !== undefined) user.college = college.trim();
    if (branch !== undefined) user.branch = branch.trim();

    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);
    }

    if (github !== undefined) user.github = github.trim();
    if (linkedin !== undefined) user.linkedin = linkedin.trim();
    if (portfolio !== undefined) user.portfolio = portfolio.trim();

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio,
        location: user.location,
        college: user.college,
        branch: user.branch,
        skills: user.skills,
        github: user.github,
        linkedin: user.linkedin,
        portfolio: user.portfolio,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

router.put(
  "/profile",
  protect,
  async (req, res) => {
    try {
      const { name, profileImage } = req.body;

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (name !== undefined) {
        user.name = name.trim();
      }

      if (profileImage !== undefined) {
        user.profileImage = profileImage;
      }

      await user.save();

      return res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error.message
      );

      return res.status(500).json({
        message: "Failed to update profile",
      });
    }
  }
);

module.exports = router;