const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Teacher = require("../models/Teacher");

exports.adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive)
      return res.status(403).json({ message: "Unauthorized" });

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.teacherAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.id);

    if (!teacher || !teacher.isActive)
      return res.status(403).json({ message: "Unauthorized" });

    req.teacher = teacher;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
