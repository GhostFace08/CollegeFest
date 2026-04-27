const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    assignments: [
      {
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        role: { type: String }, // e.g. Registration Desk, Stage Crew
        attended: { type: Boolean, default: false },
      },
    ],
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
    committee: { type: mongoose.Schema.Types.ObjectId, ref: "Committee" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);