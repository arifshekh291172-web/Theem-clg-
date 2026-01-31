const express = require("express");
const AttendanceRecord = require("../models/AttendanceRecord");
const { adminAuth, teacherAuth } = require("../middleware/auth");

const router = express.Router();

/* =====================================================
   GET ATTENDANCE RECORDS (ADMIN / TEACHER - READ ONLY)
===================================================== */
/*
GET /api/attendance-record
Query:
?department=AN
&className=FY
&subject=SUBJECT_ID
*/
router.get("/", adminAuth, async (req, res) => {
  try {
    const { department, className, subject } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (className) filter.className = className; // ✅ FINAL FIX
    if (subject) filter.subject = subject;

    const records = await AttendanceRecord.find(filter)
      .sort({ date: -1 })
      .populate("teacher", "name email")
      .populate("subject", "name")
      .populate("records.student", "rollNo name");

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});


/* =====================================================
   STUDENT ATTENDANCE SUMMARY (ADMIN)
===================================================== */
/*
GET /api/attendance-record/student/:studentId
*/
router.get("/student/:studentId", adminAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    const records = await AttendanceRecord.find({
      "records.student": studentId
    })
      .sort({ date: 1 })
      .populate("subject", "name")
      .populate("teacher", "name");

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
      percentage: total
        ? Math.round((present / total) * 100)
        : 0,
      history: records
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Student attendance report failed" });
  }
});

/* =====================================================
   DELETE ATTENDANCE RECORD (ADMIN ONLY)
===================================================== */
/*
DELETE /api/attendance-record/:id
*/
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await AttendanceRecord.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance record deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
