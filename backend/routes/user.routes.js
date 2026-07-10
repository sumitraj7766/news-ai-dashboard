const express = require("express");
const jwt = require("jsonwebtoken");
const SavedArticle = require("../models/savedArticle.model");
const User = require("../models/user.model");

const router = express.Router();


const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

router.post("/save-summary", protect, async (req, res) => {
  try {
    const savedArticle = await SavedArticle.create({
      userId: req.userId,
      ...req.body,
    });

    res.status(201).json({
      message: "Summary saved successfully",
      savedArticle,
    });
  } catch {
    res.status(500).json({ message: "Failed to save summary" });
  }
});

router.get("/summaries", protect, async (req, res) => {
  try {
    const summaries = await SavedArticle.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.json(summaries);
  } catch {
    res.status(500).json({ message: "Failed to fetch summaries" });
  }
});
router.delete("/summaries/:id", protect, async (req, res) => {
  try {
    const summary = await SavedArticle.findOne({
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

    res.json({
      message: "Summary deleted successfully",
    });
  } catch {
    res.status(500).json({
      message: "Failed to delete summary",
    });
  }
});
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, profileImage } = req.body;

    const user = await User.findById(req.userId);

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

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});
module.exports = router;