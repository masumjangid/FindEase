const path = require("path");
const fs = require("fs");
const LostItem = require("../models/LostItem");

const ARCHIVE_DIR = path.join(__dirname, "..", "data");
const ARCHIVE_FILE = path.join(ARCHIVE_DIR, "resolved-archive.txt");
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function formatEntry(item) {
  const resolutionAt = item.resolutionAt ? new Date(item.resolutionAt).toISOString() : "";
  const locationDisplay =
    (item.location || "").toLowerCase() === "other" ? item.locationOtherText || "Other" : item.location || "";
  return [
    "----------------------------------------",
    `Archived at: ${new Date().toISOString()}`,
    `Item ID: ${item._id}`,
    `Name: ${item.name || ""}`,
    `Category: ${item.category || ""}`,
    `Description: ${item.description || ""}`,
    `Location: ${locationDisplay}`,
    `Location supporting: ${item.locationSupportingText || ""}`,
    `Resolution: ${item.resolutionStatus || ""}`,
    `Resolved at: ${resolutionAt}`,
    `Report created: ${item.createdAt ? new Date(item.createdAt).toISOString() : ""}`,
    "(Image removed as per policy)",
    "",
  ].join("\n");
}

async function runArchiveCleanup() {
  const now = Date.now();
  const cutoff = new Date(now - TWENTY_FOUR_HOURS_MS);

  const toArchive = await LostItem.find({
    resolutionStatus: { $in: ["contacted", "returned", "closed"] },
    resolutionAt: { $lt: cutoff },
    archived: false,
  }).lean();

  if (toArchive.length === 0) return;

  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  for (const item of toArchive) {
    try {
      fs.appendFileSync(ARCHIVE_FILE, formatEntry(item), "utf8");
      await LostItem.findByIdAndUpdate(item._id, {
        image: "",
        archived: true,
      });
    } catch (err) {
      console.error("[FindEase] Archive cleanup error for item", item._id, err.message);
    }
  }
}

module.exports = { runArchiveCleanup, TWENTY_FOUR_HOURS_MS };
