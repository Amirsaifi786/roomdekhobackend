const express  = require("express");
const router   = express.Router();
const Property = require("../models/Property");

/* ================= GET BOOKMARKED PROPERTIES ================= */
router.get("/bookmarked-properties", async (req, res) => {
  try {
    const properties = await Property.find(
      { bookmark: true, status: 1 },
      "title price address"
    ).sort({ createdAt: -1 });

    res.json(properties);
    
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});
router.patch("/remove-bookmark/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const updated = await Property.findByIdAndUpdate(
      id,
      { $set: { bookmark: 0 } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Bookmark removed",
      data: updated
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error removing bookmark"
    });
  }
});
/* ================= REMOVE BOOKMARK ================= */
// router.patch("/remove-bookmark/:id", async (req, res) => {
//   try {
//     await Property.findByIdAndUpdate(req.params.id, { $set: { bookmark: false } });
//     res.json({ message: "Bookmark removed" });
//   } catch (err) {
//     res.status(500).json({ message: "DB error", error: err.message });
//   }
// });

/* ================= TOGGLE BOOKMARK ================= */
// router.post("/update-bookmark/:id", async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property not found"
//       });
//     }

//     // ✅ FIX (0 ↔ 1 toggle)
//     property.bookmark = property.bookmark === 1 ? 0 : 1;

//     await property.save();

//     res.json({
//       success: true,
//       message: "Bookmark updated",
//       bookmark: property.bookmark
//     });

//   } catch (err) {
//     console.error("Bookmark Error:", err);

//     res.status(500).json({
//       success: false,
//       message: "Database error"
//     });
//   }
// });
router.post("/update-bookmark/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // ✅ FORCE NUMBER + SAFE TOGGLE
    const current = Number(property.bookmark) || 0;

    const newBookmark = current === 1 ? 0 : 1;

    property.bookmark = newBookmark;

    await property.save();

    console.log("Bookmark Updated:", current, "→", newBookmark);

    res.json({
      success: true,
      message: "Bookmark updated",
      bookmark: newBookmark
    });

  } catch (err) {
    console.error("Bookmark Error:", err);

    res.status(500).json({
      success: false,
      message: "Database error"
    });
  }
});
module.exports = router;