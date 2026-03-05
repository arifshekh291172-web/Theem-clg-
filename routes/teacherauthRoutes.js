const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Teacher = require("../models/Teacher");
const TeacherAssignment = require("../models/TeacherAssignment");

const router = express.Router();

/* =========================================
   TEACHER LOGIN
========================================= */
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

    /* JWT TOKEN */
    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    /* GET ASSIGNMENTS */
    const assignments = await TeacherAssignment
      .find({ teacher: teacher._id })
      .populate("subject", "name");

    /* If no assignment */
    if (!assignments || assignments.length === 0) {

      return res.json({
        token,
        teacher: {
          id: teacher._id,
          name: teacher.name,
          email: teacher.email,
          departments: [],
          subjects: [],
          years: []
        }
      });

    }

    /* SAFE DATA FORMAT */
    const departments = [...new Set(assignments.map(a => a.department))];

    const subjects = assignments
      .map(a => a.subject?.name)
      .filter(Boolean);

    const years = [...new Set(assignments.flatMap(a => a.years || []))];

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

    console.error("Teacher Login Error:", err);

    res.status(500).json({
      message: "Teacher login failed",
      error: err.message
    });

  }

});

module.exports = router;