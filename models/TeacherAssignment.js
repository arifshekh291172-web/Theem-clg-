const mongoose = require("mongoose");

const teacherAssignmentSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true
    },

    department: {
      type: String,
      required: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    years: {
      type: [String], // ["FY","SY","TY"]
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  { timestamps: true }
);

/* 🔒 Duplicate Assignment Block */
teacherAssignmentSchema.index(
  { teacher: 1, department: 1, subject: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "TeacherAssignment",
  teacherAssignmentSchema
);
