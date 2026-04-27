const mongoose = require("mongoose");

const logisticsSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    venue: { type: String },
    checklist: [
      {
        item: { type: String },
        done: { type: Boolean, default: false },
      },
    ],
    notes: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Logistics", logisticsSchema);