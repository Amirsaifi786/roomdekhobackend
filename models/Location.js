const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    image:     { type: String, default: "" },
    available: { type: Number, default: 0 },
    status:    { type: Number, default: 1 }, // 1=active
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);