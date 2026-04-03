const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const sendMail = require("../utils/sendMail");

/* ================= SEND MESSAGE TO PROPERTY OWNER ================= */
router.post("/send-message", async (req, res) => {
  try {
    const { property_id, message } = req.body;

    console.log("Incoming property_id:", property_id);

    // ✅ Validation
    if (!property_id || !mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // ✅ Fetch property
    const property = await Property
      .findById(property_id)
      .populate("user_id", "email firstName");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.user_id) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const owner = property.user_id;

    // ✅ Send Mail
    await sendMail(
      owner.email,
      "New Property Inquiry",
      `
        <h3>Hello ${owner.firstName || "User"}</h3>
        <p>You have a new message for your property:</p>
        <p><b>Message:</b> ${message}</p>
      `
    );

    res.json({ message: "Message sent to owner successfully" });

  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({
      message: "Mail error",
      error: err.message
    });
  }
});


/* ================= CONTACT FORM MAIL ================= */
router.post("/send-mail", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log("Contact Form Data:", req.body);

    // ✅ Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Admin Mail
    await sendMail(
      process.env.ADMIN_EMAIL || "yourgmail@gmail.com",
      `Contact Form: ${subject || "New Message"}`,
      `
        <h3>New Contact Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `
    );

    // ✅ Optional: Auto reply to user
    await sendMail(
      email,
      "We received your message",
      `
        <h3>Hello ${name}</h3>
        <p>Thank you for contacting us. We will get back to you soon.</p>
      `
    );

    res.json({ message: "Message sent successfully!" });

  } catch (err) {
    console.error("Contact Mail Error:", err);
    res.status(500).json({
      message: "Mail sending failed",
      error: err.message
    });
  }
});

module.exports = router;