const express = require("express");
const mongoose = require("mongoose");
const LostItem = require("../models/LostItem");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function ensureDbReady(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  next();
}

// Add lost item (authenticated user only); starts as not approved
router.post("/add", ensureDbReady, verifyToken, async (req, res) => {
  try {
    const { name, category, description, image } = req.body || {};

    if (!name?.trim() || !category?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "name, category, and description are required." });
    }

    const item = await LostItem.create({
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      image: typeof image === "string" ? image : "",
      approved: false,
      createdBy: req.user._id,
    });

    return res.status(201).json({ message: "Lost item reported. It will appear after admin approval.", item });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// List items: non-admin gets only approved (recent first); admin can get all or pending
router.get("/all", ensureDbReady, async (req, res) => {
  try {
    const items = await LostItem.find({})
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Public or optional auth: "approved" list for dashboard (only approved, recent)
router.get("/approved", ensureDbReady, async (req, res) => {
  try {
    const items = await LostItem.find({ approved: true })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Admin: list pending (not approved) items
router.get("/pending", ensureDbReady, verifyToken, requireAdmin, async (req, res) => {
  try {
    const items = await LostItem.find({ approved: false })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Admin: approve a lost item so it shows to everyone
router.patch("/:id/approve", ensureDbReady, verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid item id." });
    }
    const item = await LostItem.findByIdAndUpdate(id, { approved: true }, { new: true });
    if (!item) return res.status(404).json({ message: "Item not found." });
    return res.status(200).json({ message: "Item approved.", item });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// My reports (authenticated): items created by current user
router.get("/my-reports", ensureDbReady, verifyToken, async (req, res) => {
  try {
    const items = await LostItem.find({ createdBy: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

module.exports = router;
