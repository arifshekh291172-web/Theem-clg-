const express = require("express");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middleware/adminAuth");

const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const TeacherAssignment = require("../models/TeacherAssignment");

const router = express.Router();

/* =====================================================
   CREATE TEACHER (ADMIN / HOD / PRINCIPAL / DIRECTOR)
   ===================================================== */
/*
POST /api/admin/teachers
Headers:
Authorization: Bearer ADMIN_TOKEN

Body:
{
  "name": "Rahul Sir",
  "email": "rahul@gmail.com",
  "password": "123456"
}
*/
router.post("/teachers", adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await Teacher.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({
      message: "Teacher created successfully",
      teacherId: teacher._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create teacher failed" });
  }
});

/* =====================================================
   ASSIGN TEACHER (DB ONLY – NO UPDATE IN TEACHER MODEL)
   ===================================================== */
/*
POST /api/admin/assign-teacher
*/
router.post("/assign-teacher", adminAuth, async (req, res) => {
  try {
    const { teacherId, department, subjectId, years } = req.body;

    if (
      !teacherId ||
      !department ||
      !subjectId ||
      !Array.isArray(years) ||
      !years.length
    ) {
      return res.status(400).json({ message: "Invalid assignment data" });
    }

    /* Validate Teacher */
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    /* Validate Subject */
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    /* Create Assignment */
    const assignment = await TeacherAssignment.create({
      teacher: teacherId,
      department,
      subject: subjectId,
      years,
      assignedBy: req.admin._id
    });

    const populated = await TeacherAssignment.findById(assignment._id)
      .populate("teacher", "name email")
      .populate("subject", "name");

    res.json({
      message: "Teacher assigned successfully",
      assignment: populated
    });

  } catch (err) {
    /* Duplicate assignment block */
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Teacher already assigned to this subject & department"
      });
    }

    console.error(err);
    res.status(500).json({ message: "Teacher assignment failed" });
  }
});

/* =====================================================
   GET ALL ASSIGNED TEACHERS (ADMIN DASHBOARD)
   ===================================================== */
/*
GET /api/admin/assigned-teachers
*/
router.get("/assigned-teachers", adminAuth, async (req, res) => {
  try {
    const assignments = await TeacherAssignment.find()
      .populate("teacher", "name email")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Failed to load assignments" });
  }
});

/* =====================================================
   DELETE TEACHER ASSIGNMENT
   ===================================================== */
/*
DELETE /api/admin/assignment/:id
*/
router.delete("/assignment/:id", adminAuth, async (req, res) => {
  try {
    const assignment = await TeacherAssignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete assignment" });
  }
});

/* =====================================================
   GET SINGLE TEACHER ASSIGNMENTS
   ===================================================== */
/*
GET /api/admin/teacher-assignments/:teacherId
*/
router.get("/teacher-assignments/:teacherId", adminAuth, async (req, res) => {
  try {
    const data = await TeacherAssignment.find({
      teacher: req.params.teacherId
    })
      .populate("subject", "name");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to load teacher assignments" });
  }
});

module.exports = router;
