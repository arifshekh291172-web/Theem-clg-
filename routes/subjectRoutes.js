const express = require("express");
const Subject = require("../models/Subject");
const authAdmin = require("../middleware/adminAuth");

const router = express.Router();

/* =====================================================
   ADD SUBJECT (ADMIN)
   POST /api/admin/subjects
===================================================== */
router.post("/subjects", authAdmin, async (req, res) => {
  try {
    const { name, department, years } = req.body;

    if (!name || !department || !Array.isArray(years) || !years.length) {
      return res.status(400).json({
        message: "Invalid subject data"
      });
    }

    const exists = await Subject.findOne({ name, department });
    if (exists) {
      return res.status(400).json({
        message: "Subject already exists"
      });
    }

    const subject = await Subject.create({
      name,
      department,
      years
    });

    res.status(201).json({
      message: "Subject added successfully",
      subject
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to add subject"
    });
  }
});

/* =====================================================
   LIST SUBJECTS (ADMIN ASSIGN)
   GET /api/admin/subjects
===================================================== */
router.get("/subjects", authAdmin, async (req, res) => {
  try {
    const { department, year } = req.query;

    const filter = {};
    if (department) filter.department = department;
    if (year) filter.years = year;

    const subjects = await Subject.find(filter).sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load subjects"
    });
  }
});

/* =====================================================
   DELETE SUBJECT (ADMIN)
   DELETE /api/admin/subjects/:id
===================================================== */
router.delete("/subjects/:id", authAdmin, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Delete failed"
    });
  }
});

module.exports = router;
