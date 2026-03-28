const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    user_id:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offerType:     { type: String, default: "" },
    propertyType:  { type: String, default: "" },
    pgType:        { type: String, default: "" },
    price:         { type: Number, default: 0 },
    rooms:         { type: Number, default: 0 },
    bathrooms:     { type: Number, default: 0 },
    parking:       { type: String, default: "" },
    address:       { type: String, default: "" },
    locality:      { type: String, default: "" },
    nearbyRoad:    { type: String, default: "" },
    title:         { type: String, required: true },
    slug:          { type: String, unique: true },
    description:   { type: String, default: "" },
    features:      { type: [String], default: [] },
    images:        { type: [String], default: [] },
    video:         { type: String, default: "" },
    singlePrice:   { type: Number, default: null },
    doublePrice:   { type: Number, default: null },
    triplePrice:   { type: Number, default: null },
    meals:         { type: String, default: "" },
    bookmark:      { type: Boolean, default: false }, 
    status: {
  type: Number,
  default: 1
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);