const express  = require("express");
const router   = express.Router();
const Property = require("../models/Property");
const sendMail = require("../utils/sendMail");

/* ================= SEND MESSAGE TO PROPERTY OWNER ================= */
router.post("/send-message", async (req, res) => {
  try {
    const { property_id, message } = req.body;

    const property = await Property.findById(property_id).populate("user_id", "email firstName");

    if (!property)          return res.status(404).json({ message: "Property not found" });
    if (!property.user_id)  return res.status(404).json({ message: "Owner not found" });

    const owner = property.user_id;

    await sendMail(
      owner.email,
      "New Property Inquiry",
      `<h3>Hello ${owner.firstName}</h3><p>You have a new message:</p><p>${message}</p>`
    );

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mail error", error: err.message });
  }
});

module.exports = router;