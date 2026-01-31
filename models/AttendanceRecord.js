const mongoose = require("mongoose");

/*
  One document = ONE LECTURE
  Example:
  - Date: 2025-01-20
  - Subject: Applied Maths
  - Class: FY
  - Teacher: Prof XYZ
  - Records: [{ student, status }]
*/

const attendanceRecordSchema = new mongoose.Schema(
  {
    /* 📅 Lecture Date */
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    /* 🏫 Class Details */
    department: {
      type: String,
      required: true // AN / AI / CE
    },

    className: {
      type: String,
      enum: ["FY", "SY", "TY"],
      required: true
    },

    /* 📘 Subject */
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    /* 👨‍🏫 Teacher */
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    /* 👨‍🎓 Student-wise Attendance */
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true
        },
        status: {
          type: String,
          enum: ["P", "A"],
          default: "A"
        }
      }
    ]
  },
  {
    timestamps: true // createdAt = lecture created time
  }
);

/* =====================================================
   INDEXES (IMPORTANT)
   Prevent duplicate lecture for same class + subject + date
   ===================================================== */
attendanceRecordSchema.index(
  { date: 1, department: 1, className: 1, subject: 1 },
  { unique: true }
);

/* =====================================================
   PRE-SAVE VALIDATION
   Prevent duplicate student entries in same lecture
   ===================================================== */
attendanceRecordSchema.pre("save", function (next) {
  const ids = this.records.map(r => r.student.toString());
  const uniqueIds = new Set(ids);

  if (ids.length !== uniqueIds.size) {
    return next(new Error("Duplicate student in attendance records"));
  }

  next();
});

module.exports = mongoose.model(
  "AttendanceRecord",
  attendanceRecordSchema
);
