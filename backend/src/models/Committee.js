const mongoose = require("mongoose");

const committeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // superadmin
  },
  { timestamps: true }
);

module.exports = mongoose.model("Committee", committeeSchema);