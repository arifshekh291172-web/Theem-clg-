const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      required: true,
      enum: ["AN", "AI", "CE", "ME", "EE"],
      uppercase: true
    },

    years: {
      type: [String], // ["FY","SY","TY"]
      required: true
    }
  },
  { timestamps: true }
);

/* 🔒 Prevent duplicate subject in same dept */
subjectSchema.index(
  { name: 1, department: 1 },
  { unique: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
