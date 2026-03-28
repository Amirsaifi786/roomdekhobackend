const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const Location = require("../models/Location");

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ================= GET LOCATIONS ================= */
router.get("/locations", async (req, res) => {
  try {
    const locations = await Location.find(
      { status: 1 },
      "title image available"
    ).sort({ createdAt: -1 });

    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

/* ================= ADD LOCATION ================= */
router.post("/add-location", upload.single("image"), async (req, res) => {
  try {
    const { title, available } = req.body;
    const image = req.file ? req.file.filename : "";

    const location = await Location.create({ title, image, available: Number(available) || 0 });

    res.json({ message: "Location added successfully", id: location._id });
  } catch (err) {
    res.status(500).json({ message: "Error inserting location", error: err.message });
  }
});

/* ================= UPDATE LOCATION ================= */
router.put("/update-location/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, available } = req.body;

    const updateData = { title, available: Number(available) || 0 };
    if (req.file) updateData.image = req.file.filename;

    await Location.findByIdAndUpdate(req.params.id, { $set: updateData });

    res.json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ message: "Update error", error: err.message });
  }
});

/* ================= DELETE LOCATION ================= */
router.delete("/delete-location/:id", async (req, res) => {
  try {
    await Location.findByIdAndDelete(req.params.id);
    res.json({ message: "Location deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete error", error: err.message });
  }
});

module.exports = router;