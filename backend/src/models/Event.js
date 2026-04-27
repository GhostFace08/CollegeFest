const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["technical", "cultural", "sports", "other"], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    capacity: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    teamSize: { type: Number, default: 1 }, // 1 = solo
    entryFee: { type: Number, default: 0 }, // display only, pay at venue
    poster: { type: String }, // image URL
    status: { type: String, enum: ["draft", "pending", "approved", "rejected", "unpublished"], default: "draft" },
    rejectionNote: { type: String },
    committee: { type: mongoose.Schema.Types.ObjectId, ref: "Committee", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);