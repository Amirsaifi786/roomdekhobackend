const express = require("express");
const cors    = require("cors");
require("dotenv").config(); // ← only once, at the top

const connectDB = require("./db");

// Routes
const authRoutes = require("./routes/auth");
const propertyRoutes     = require("./routes/property");
const locationRoutes     = require("./routes/location");
const bookmarkRoutes     = require("./routes/bookmark");
const messageRoutes      = require("./routes/message");
const propertyUserRoutes = require("./routes/propertyuser");

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploaded images
app.use("/uploads", express.static("uploads"));

// ============================================================
// ROUTES
// ============================================================
app.use("/api/auth",          authRoutes);
app.use("/api/property",      propertyRoutes);
app.use("/api/location",      locationRoutes);
app.use("/api/bookmark",      bookmarkRoutes);
app.use("/api/message",       messageRoutes);
app.use("/api/property-user", propertyUserRoutes);
app.use("/api/user",          authRoutes);
// app.use("/api/auth", require("./routes/auth"));
// Health check
app.get("/", (req, res) => {
  res.send("Backend running!");
});

// ============================================================
// CONNECT DB THEN START SERVER
// ============================================================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});