const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const Student = require("../models/Student");
const authAdmin = require("../middleware/adminAuth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* =====================================================
   CREATE / UPSERT SINGLE STUDENT (MANUAL ADD)
===================================================== */
router.post("/", authAdmin, async (req, res) => {
  try {
    const {
      rollNo,
      name,
      department,
      className,   // ✅ FIX
      division,
      parentEmail
    } = req.body;

    if (!rollNo || !name || !department || !className) {
      return res.status(400).json({
        message: "RollNo, Name, Department and Class are required"
      });
    }

    const student = await Student.findOneAndUpdate(
      {
        rollNo,
        department,
        className,
        division: division || "A"
      },
      {
        rollNo,
        name,
        department,
        className,
        division: division || "A",
        parentEmail: parentEmail || ""
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(student);
  } catch (err) {
    console.error("Add Student Error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

/* =====================================================
   BULK UPLOAD STUDENTS (CSV / XLSX)
   EXPECTED COLUMNS:
   rollNo | name | parentEmail (optional)
===================================================== */
router.post(
  "/upload",
  authAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      const { department, className, division } = req.body;

      if (!req.file || !department || !className) {
        return res.status(400).json({
          message: "File, department and class are required"
        });
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let added = 0;
      let skipped = 0;

      for (const r of rows) {
        if (!r.rollNo || !r.name) {
          skipped++;
          continue;
        }

        const exists = await Student.findOne({
          rollNo: r.rollNo,
          department,
          className,
          division: division || "A"
        });

        if (exists) {
          skipped++;
          continue;
        }

        await Student.create({
          rollNo: r.rollNo,
          name: r.name,
          parentEmail: r.parentEmail || "",
          department,
          className,
          division: division || "A"
        });

        added++;
      }

      res.json({
        message: "Students uploaded successfully",
        added,
        skipped
      });
    } catch (err) {
      console.error("Upload Error:", err.message);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

/* =====================================================
   GET STUDENTS (FILTER BY DEPT + CLASS)
===================================================== */
router.get("/", authAdmin, async (req, res) => {
  try {
    const { department, className } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (className) filter.className = className;

    const students = await Student.find(filter).sort({ rollNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   UPDATE PARENT EMAIL
===================================================== */
router.patch("/:id/parent-email", authAdmin, async (req, res) => {
  try {
    const { parentEmail } = req.body;

    if (!parentEmail) {
      return res.status(400).json({
        message: "Parent email required"
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { parentEmail },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Parent email updated",
      student
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =====================================================
   DELETE STUDENT
===================================================== */
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
