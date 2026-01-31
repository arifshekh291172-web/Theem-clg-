const express = require("express");
const Student = require("../models/Student");
const { teacherAuth } = require("../middleware/Auth");

const router = express.Router();

/* =====================================================
   GET STUDENTS FOR TEACHER (SAFE ROUTE)
===================================================== */
router.get("/students", teacherAuth, async (req, res) => {
    try {
        const { department, className } = req.query;

        if (!department || !className) {
            return res.status(400).json({
                message: "department and className are required"
            });
        }

        const students = await Student.find({
            department,
            className
        })
            .select("rollNo name parentEmail")
            .sort({ rollNo: 1 });

        res.json(students);

    } catch (err) {
        console.error("Teacher Students Error:", err.message);
        res.status(500).json({ message: "Failed to load students" });
    }
});

module.exports = router;
