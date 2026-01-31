const AttendanceRecord = require("../models/AttendanceRecord");
const Student = require("../models/Student");
const { sendAbsentMail } = require("../utils/mailer");

/* ================= SAVE ATTENDANCE ================= */
exports.saveAttendance = async (req, res) => {
  try {
    const {
      date,
      department,
      className,
      subjectId,
      records
    } = req.body;

    const attendance = await AttendanceRecord.create({
      date,
      department,
      className,
      subject: subjectId,
      teacher: req.user.id,
      records
    });

    /* 🔔 Notify parents of absentees */
    for (const r of records) {
      if (r.status === "A") {
        const stu = await Student.findById(r.student);
        if (stu?.parentEmail) {
          await sendAbsentMail(
            stu.parentEmail,
            stu.name,
            date,
            subjectId
          );
        }
      }
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Attendance save failed" });
  }
};
