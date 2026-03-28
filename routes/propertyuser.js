const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const mongoose = require("mongoose");

/* ================= GET PROPERTIES BY USER ================= */
router.post("/user", async (req, res) => {
  try {
    const { user_id, page = 1, limit = 5 } = req.body;

    const total = await Property.countDocuments({ user_id });

    const properties = await Property.find({ user_id })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      data: properties,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });

  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "DB error",
    });
  }
});

/* ================= UPDATE PROPERTY STATUS ================= */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    console.log("👉 Updating:", id, status);

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    // ✅ Check before update
    const before = await Property.findById(id);
    console.log("Before Status:", before?.status);

    if (!before) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // ✅ UPDATE (FINAL FIX)
    const result = await Property.updateOne(
      { _id: id },
      { $set: { status: Number(status) } }
    );

    console.log("Mongo Result:", result);

    // ✅ Check update result
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // 🔥 Get updated record
    const updated = await Property.findById(id);
    console.log("After Status:", updated?.status);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: updated,
    });

  } catch (error) {
    console.error("❌ DB Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;