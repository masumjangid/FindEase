const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();
const ALLOWED_DOMAIN = "poornima.edu.in";

function ensureDbReady(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database not connected." });
  }
  next();
}

function validateEmailDomain(email) {
  if (!email || typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(`@${ALLOWED_DOMAIN}`);
}

// Signup – only @poornima.edu.in
router.post("/signup", ensureDbReady, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (!validateEmailDomain(email)) {
      return res.status(400).json({
        message: `Only @${ALLOWED_DOMAIN} email addresses can sign up.`,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "user",
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({
      message: "Account created.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Login – only @poornima.edu.in allowed to log in
router.post("/login", ensureDbReady, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    if (!validateEmailDomain(email)) {
      return res.status(403).json({
        message: `Only @${ALLOWED_DOMAIN} email addresses can log in.`,
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({
      message: "Logged in.",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error.", error: err?.message });
  }
});

// Get current user (protected)
router.get("/me", ensureDbReady, verifyToken, (req, res) => {
  return res.status(200).json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
