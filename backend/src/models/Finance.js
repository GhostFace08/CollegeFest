const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, unique: true },
    budget: { type: Number, default: 0 },
    expectedRevenue: { type: Number, default: 0 }, // auto: registrations x entryFee
    expenses: [
      {
        label: { type: String },
        amount: { type: Number },
        note: { type: String },
      },
    ],
    committee: { type: mongoose.Schema.Types.ObjectId, ref: "Committee" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Finance", financeSchema);