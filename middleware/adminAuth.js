const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ Allow ALL admin roles
    req.admin = admin;
    next();

  } catch (err) {
    console.error("AdminAuth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
