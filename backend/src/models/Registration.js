const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamMembers: [{ name: String, email: String, phone: String }], // for group events
    qrCode: { type: String }, // base64 or URL
    registrationId: { type: String, unique: true, required: true },
    status: { type: String, enum: ["confirmed", "cancelled", "attended"], default: "confirmed" },
    checkedIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", registrationSchema);