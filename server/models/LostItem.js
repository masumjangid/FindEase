const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    approved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    location: { type: String, default: "" },
    locationOtherText: { type: String, default: "" },
    locationSupportingText: { type: String, default: "" },
    resolutionStatus: { type: String, default: "" },
    resolutionAt: { type: Date, default: null },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostItem", lostItemSchema);

