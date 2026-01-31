const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const TeacherAssignment = require("../models/TeacherAssignment");
const { teacherAuth, adminAuth } = require("../middleware/Auth");
const { sendAbsentMail } = require("../utils/mailer");

const router = express.Router();

/* =====================================================
   SAVE ATTENDANCE (TEACHER ONLY – DB VERIFIED)
===================================================== */
/*
POST /api/attendance/save
Authorization: Bearer TEACHER_TOKEN
*/
router.post("/save", teacherAuth, async (req, res) => {
  try {
    const { date, department, className, subjectId, records } = req.body;

    if (!date || !department || !className || !subjectId || !records?.length) {
      return res.status(400).json({ message: "Invalid attendance data" });
    }

    /* 🔒 Verify teacher is assigned */
    const assignment = await TeacherAssignment.findOne({
      teacher: req.teacher._id,
      department,
      subject: subjectId,
      years: className
    });

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this subject/class"
      });
    }

    /* 🔒 Prevent duplicate lecture */
    const exists = await AttendanceRecord.findOne({
      date,
      department,
      className,
      subject: subjectId
    });

    if (exists) {
      return res.status(409).json({
        message: "Attendance already marked for this lecture"
      });
    }

    /* 💾 Save attendance */
    const attendance = await AttendanceRecord.create({
      date,
      department,
      className,
      subject: subjectId,
      teacher: req.teacher._id,
      assignment: assignment._id,
      records
    });

    /* 📧 Absent email (with subject name) */
    const subject = await Subject.findById(subjectId).select("name");

    for (const r of records) {
      if (r.status === "A") {
        const stu = await Student.findById(r.student);
        if (stu?.parentEmail) {
          await sendAbsentMail(
            stu.parentEmail,
            stu.name,
            date,
            subject.name
          );
        }
      }
    }

    res.json({
      message: "Attendance saved successfully",
      attendanceId: attendance._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Attendance save failed" });
  }
});

/* =====================================================
   GET ATTENDANCE (ADMIN / TEACHER)
===================================================== */
router.get("/list", adminAuth, async (req, res) => {
  try {
    const { department, className, subject } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (className) filter.className = className;
    if (subject) filter.subject = subject;

    const data = await AttendanceRecord.find(filter)
      .populate("teacher", "name email")
      .populate("subject", "name")
      .populate("records.student", "rollNo name");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
});

/* =====================================================
   STUDENT ATTENDANCE SUMMARY (ADMIN / TEACHER)
===================================================== */
router.get("/student/:studentId", adminAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await AttendanceRecord.find({
      "records.student": studentId
    }).populate("subject", "name");

    let total = 0;
    let present = 0;

    records.forEach(r => {
      r.records.forEach(rec => {
        if (rec.student.toString() === studentId) {
          total++;
          if (rec.status === "P") present++;
        }
      });
    });

    res.json({
      totalLectures: total,
      present,
      absent: total - present,
      percentage: total ? Math.round((present / total) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ message: "Student report error" });
  }
});

module.exports = router;
