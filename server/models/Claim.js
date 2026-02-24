const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "LostItem", required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    contactInfo: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["pending", "contacted", "returned", "closed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
