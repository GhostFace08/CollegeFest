const mongoose = require("mongoose");

const sponsorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
    dealAmount: { type: Number, default: 0 },
    dealType: { type: String, enum: ["cash", "in-kind"], default: "cash" },
    status: { type: String, enum: ["contacted", "negotiating", "confirmed", "received"], default: "contacted" },
    actionChecklist: [
      {
        task: { type: String },
        done: { type: Boolean, default: false },
      },
    ],
    notes: { type: String },
    committee: { type: mongoose.Schema.Types.ObjectId, ref: "Committee" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sponsor", sponsorSchema);