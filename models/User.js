const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName:  { type: String, default: "" },
    email:     { type: String, required: true, unique: true },
    phone:     { type: String, default: "" },
    password:  { type: String, required: true },
    role:      { type: String, enum: ["user", "owner", "admin", "Broker"], default: "user" },
    photo:     { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);