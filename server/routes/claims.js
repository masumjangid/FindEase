const express = require("express");
const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const LostItem = require("../models/LostItem");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function ensureDbReady(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  next();
}

// User: submit a claim for an item (this item is mine)
router.post("/", ensureDbReady, verifyToken, async (req, res) => {
  try {
    const { itemId, message, contactInfo } = req.body || {};

    if (!itemId || !message?.trim()) {
      return res.status(400).json({ message: "itemId and message are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item id." });
    }

    const item = await LostItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });
    if (!item.approved) return res.status(400).json({ message: "You can only claim approved items." });

    const claim = await Claim.create({
      item: item._id,
      claimedBy: req.user._id,
      message: message.trim(),
      contactInfo: (contactInfo || "").trim(),
    });

    const populated = await Claim.findById(claim._id)
      .populate("item", "name category description")
      .populate("claimedBy", "name email")
      .lean();

    return res.status(201).json({ message: "Claim submitted. Admin will contact you.", claim: populated });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Admin: list all claims with item and claimant details (to connect owner + claimant)
router.get("/", ensureDbReady, verifyToken, requireAdmin, async (req, res) => {
  try {
    const claims = await Claim.find({})
      .populate("item")
      .populate("claimedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const itemIds = [...new Set(claims.map((c) => c.item?._id).filter(Boolean))];
    const owners = await LostItem.find({ _id: { $in: itemIds } })
      .populate("createdBy", "name email")
      .lean();
    const ownerByItem = Object.fromEntries(owners.map((o) => [o._id.toString(), o.createdBy]));

    const withOwner = claims.map((c) => ({
      ...c,
      owner: c.item ? ownerByItem[c.item._id.toString()] : null,
    }));

    return res.status(200).json({ claims: withOwner });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Admin: update claim status (contacted, returned, closed)
router.patch("/:id", ensureDbReady, verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid claim id." });
    }
    const allowed = ["pending", "contacted", "returned", "closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const claim = await Claim.findByIdAndUpdate(id, { status }, { new: true })
      .populate("item", "name category")
      .populate("claimedBy", "name email")
      .lean();
    if (!claim) return res.status(404).json({ message: "Claim not found." });
    return res.status(200).json({ message: "Claim updated.", claim });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

module.exports = router;
