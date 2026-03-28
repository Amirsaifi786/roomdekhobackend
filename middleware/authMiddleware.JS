const jwt = require("jsonwebtoken");

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

module.exports = authMiddleware;