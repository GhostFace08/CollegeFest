require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

connectDB().then(async () => {
  await mongoose.connection.collection("users").deleteMany({ role: { $ne: "superadmin" } });
  await mongoose.connection.collection("committees").deleteMany({});
  await mongoose.connection.collection("events").deleteMany({});
  await mongoose.connection.collection("registrations").deleteMany({});
  console.log("✅ Seed data cleared. Superadmin untouched.");
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });