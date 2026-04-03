const express = require("express");
const router = express.Router();
const multer = require("multer");
const Location = require("../models/Location");

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ================= GET ALL ================= */
router.get("/locations", async (req, res) => {
    try {
        // Ensure _id is included in the query
        const locations = await Location.find({ status: 1 })
            .select("_id title image available") 
            .sort({ createdAt: -1 });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: "Database error", error: err.message });
    }
});

/* ================= ADD NEW ================= */
router.post("/add-location", upload.single("image"), async (req, res) => {
    try {
        const { title, available } = req.body;
        const image = req.file ? req.file.filename : "";
        const location = await Location.create({ 
            title, 
            image, 
            available: Number(available) || 0 
        });
        res.json({ message: "Location added successfully", _id: location._id });
    } catch (err) {
        res.status(500).json({ message: "Error inserting location", error: err.message });
    }
});

/* ================= UPDATE EXISTING ================= */
router.put("/update-location/:id", upload.single("image"), async (req, res) => {
    try {
        const { title, available } = req.body;
        const updateData = { title, available: Number(available) || 0 };
        
        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updated = await Location.findByIdAndUpdate(
            req.params.id, 
            { $set: updateData },
            { new: true } // Returns the updated document
        );

        if (!updated) {
            return res.status(404).json({ message: "Location not found" });
        }

        res.json({ message: "Location updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Update error", error: err.message });
    }
});

/* ================= DELETE ================= */
router.delete("/delete-location/:id", async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.json({ message: "Location deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete error", error: err.message });
    }
});

module.exports = router;