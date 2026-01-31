const express = require("express");
const nodemailer = require("nodemailer");
const Student = require("../models/Student");

const router = express.Router();

/* =====================================
   SUBMIT ATTENDANCE + EMAIL
===================================== */
router.post("/submit-attendance", async (req, res) => {
    try {
        const { date, department, subject, year, attendance } = req.body;

        if (!date || !attendance || !attendance.length) {
            return res.status(400).json({ message: "Invalid attendance data" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        for (const a of attendance) {
            const student = await Student.findOne({ roll: a.roll });

            if (!student || !student.parentEmail) continue;

            await transporter.sendMail({
                from: `"Attendance System" <${process.env.EMAIL_USER}>`,
                to: student.parentEmail,
                subject: "Attendance Notification",
                html: `
                    <p>Dear Parent,</p>
                    <p>Your ward <b>${student.name}</b> was marked
                    <b>${a.status}</b> on <b>${date}</b>.</p>

                    <p>
                        <b>Department:</b> ${department}<br>
                        <b>Subject:</b> ${subject}<br>
                        <b>Year:</b> ${year}
                    </p>

                    <p>Regards,<br>Theem College of Engineering</p>
                `
            });
        }

        res.json({ message: "Attendance submitted & emails sent" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Attendance submission failed" });
    }
});

module.exports = router;
