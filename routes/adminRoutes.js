const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const Teacher = require("../models/Teacher");
const authAdmin = require("../middleware/adminAuth");

/* ======================================================
   GET ALL TEACHERS
   GET /api/admin/teachers
====================================================== */
router.get("/teachers", authAdmin, async (req, res) => {
    try {
        const teachers = await Teacher.find().select("-password");
        res.json(teachers);
    } catch (err) {
        console.error("Fetch Teachers Error:", err.message);
        res.status(500).json({ message: "Failed to load teachers" });
    }
});

/* ======================================================
   CREATE TEACHER
   POST /api/admin/create-teacher
====================================================== */
router.post("/create-teacher", authAdmin, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const exists = await Teacher.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({
                message: "Teacher already exists"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const teacher = await Teacher.create({
            name,
            email: email.toLowerCase(),
            password: hashed
        });

        res.status(201).json({
            message: "Teacher created successfully",
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email
            }
        });

    } catch (err) {
        console.error("Create Teacher Error:", err.message);
        res.status(500).json({ message: "Failed to create teacher" });
    }
});

/* ======================================================
   DELETE TEACHER
   DELETE /api/admin/delete-teacher/:id
====================================================== */
router.delete("/delete-teacher/:id", authAdmin, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        await teacher.deleteOne();
        res.json({ message: "Teacher deleted successfully" });

    } catch (err) {
        console.error("Delete Teacher Error:", err.message);
        res.status(500).json({ message: "Failed to delete teacher" });
    }
});

/* ======================================================
   RESET TEACHER PASSWORD
   PUT /api/admin/reset-teacher-password/:id
====================================================== */
router.put("/reset-teacher-password/:id", authAdmin, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { password: hashed },
            { new: true }
        );

        if (!teacher) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        res.json({ message: "Password reset successful" });

    } catch (err) {
        console.error("Reset Password Error:", err.message);
        res.status(500).json({ message: "Password reset failed" });
    }
});

module.exports = router;
