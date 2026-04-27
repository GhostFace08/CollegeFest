require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  });

  const existing = await User.findOne({ role: "superadmin" });
  if (existing) {
    console.log("Superadmin already exists:", existing.email);
    process.exit(0);
  }

  await User.create({
    name: "Super Admin",
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
    role: "superadmin",
    isApproved: true,
  });

  console.log("Superadmin seeded successfully:", process.env.SUPERADMIN_EMAIL);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});