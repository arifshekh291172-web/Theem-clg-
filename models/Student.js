const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: Number,
      required: true,
      min: 1
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    /* ================= OPTIONAL STUDENT INFO ================= */
    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    studentPhone: {
      type: String,
      trim: true,
      default: ""
    },

    /* ================= PARENT CONTACT ================= */
    parentEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""   // popup se later add hoga
    },

    parentPhone: {
      type: String,
      trim: true,
      default: ""
    },

    /* ================= ACADEMIC INFO ================= */
    department: {
      type: String,
      required: true,
      enum: ["AN", "AI", "CE", "ME", "EE"],
      uppercase: true
    },

    className: {
      type: String,
      required: true,
      enum: ["FY", "SY", "TY"]
    },

    division: {
      type: String,
      enum: ["A", "B"],
      uppercase: true,
      default: "A"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

/* =====================================================
   🔒 UNIQUE STUDENT CONSTRAINT
   Roll No must be unique within:
   Department + Year + Division
===================================================== */
studentSchema.index(
  { rollNo: 1, department: 1, className: 1, division: 1 },
  { unique: true }
);

module.exports = mongoose.model("Student", studentSchema);
