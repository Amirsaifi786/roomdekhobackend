const express  = require("express");
const router   = express.Router();
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const multer   = require("multer");
const User     = require("../models/User");
const sendMail = require("../utils/sendMail");

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ================= OTP STORE ================= */
let otpStore = {};

/* ================= AUTH MIDDLEWARE ================= */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔐 AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("✅ TOKEN VERIFIED:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.error("❌ JWT ERROR:", err.message);

    return res.status(401).json({
      error: true,
      message: "Token expired or invalid. Please login again.",
    });
  }
};

// router.post("/send-otp", async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: "Email required" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000);

//     otpStore[email] = otp;

//     console.log("OTP:", otp); // DEBUG

//     await sendMail(email, "Your OTP Code", `<h2>Your OTP is: ${otp}</h2>`);

//     res.json({ success: true, message: "OTP sent successfully" });

//   } catch (error) {
//     console.error("SEND OTP ERROR:", error);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// });

router.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp: String(otp), // ✅ ALWAYS STRING
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log("✅ OTP STORED:", otpStore[email]); // DEBUG

    await sendMail(email, "Your OTP Code", `<h2>${otp}</h2>`);

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});
/* ================= VERIFY OTP ================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const otp   = String(req.body.otp); // ✅ FORCE STRING

    const record = otpStore[email];

    console.log("👉 Stored:", record);
    console.log("👉 Entered:", otp);

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[email];

    res.json({ verified: true });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= REGISTER ================= */
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & Password required" });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "testsecret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });

  } catch (err) {
    console.error("❌ REGISTER ERROR:", err);
    res.status(500).json({
      message: err.message, // 👈 show real error
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid Email" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Invalid Password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photo: user.photo || ""
      },
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE PROFILE ================= */
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      console.log("🟢 UPDATE USER:", userId);

      const { firstName, lastName, email, phone, role } = req.body;

      const updateData = {
        firstName,
        lastName,
        email,
        role,
      };

      if (phone) updateData.phone = phone;

      if (req.file) {
        updateData.photo = `/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          error: true,
          message: "User not found",
        });
      }

      res.json({
        error: false,
        message: "Profile updated successfully",
        user: updatedUser,
      });

    } catch (error) {
      console.error("❌ UPDATE PROFILE ERROR:", error);

      res.status(500).json({
        error: true,
        message: "Server error",
      });
    }
  }
);

/* ================= CHANGE PASSWORD ================= */
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password required" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      $set: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("❌ CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.put("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    if (!otpStore[email] || otpStore[email] != otp)
      return res.status(400).json({ message: "Invalid OTP" });

    delete otpStore[email];

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } }
    );

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    console.error("❌ RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;