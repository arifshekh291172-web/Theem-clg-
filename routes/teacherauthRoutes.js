const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Teacher = require("../models/Teacher");
const TeacherAssignment = require("../models/TeacherAssignment");

const router = express.Router();

/* =====================================================
   TEACHER LOGIN (FINAL – ASSIGNMENT BASED)
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const teacher = await Teacher.findOne({ email, isActive: true });
    if (!teacher) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, teacher.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* 🔐 JWT */
    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* 🔥 GET ADMIN ASSIGNMENT (MOST IMPORTANT PART) */
    const assignments = await TeacherAssignment
      .find({ teacher: teacher._id })
      .populate("subject", "name");

    if (!assignments.length) {
      return res.json({
        token,
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          assignments: []   // no assignment yet
        }
      });
    }

    /* 🔄 Normalize data for frontend */
    const departments = [...new Set(assignments.map(a => a.department))];
    const subjects = assignments.map(a => a.subject.name);
    const years = [...new Set(assignments.flatMap(a => a.years))];

    res.json({
      token,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        departments,
        subjects,
        years
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Teacher login failed" });
  }
});

module.exports = router;
