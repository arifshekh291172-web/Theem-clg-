require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

/* ================= APP INIT ================= */
const app = express();

/* ================= MIDDLEWARES ================= */
app.use(
  cors({
    origin: "*",
    credentials: true
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ================= DB CONNECTION ================= */
const connectDB = require("./config/db");
connectDB();

/* ================= ROUTES IMPORT ================= */

/* AUTH */
const adminauthRoutes = require("./routes/adminauthRoutes");
const teacherauthRoutes = require("./routes/teacherauthRoutes");

/* ADMIN CORE */
const adminRoutes = require("./routes/adminRoutes");

/* ADMIN ASSIGN */
const adminAssignRoutes = require("./routes/adminAssignRoutes");

/* SUBJECTS */
const subjectRoutes = require("./routes/subjectRoutes");

/* STUDENTS */
const studentRoutes = require("./routes/studentRoutes");
const teacherStudentRoutes = require("./routes/teacherStudentRoutes");

/* ATTENDANCE */
const attendanceRoutes = require("./routes/attendanceRoutes");
const attendancerecordRoutes = require("./routes/attendancerecordRoutes");

/* NOTIFICATIONS */
const notificationRoutes = require("./routes/notificationRoutes");

/* ================= USE ROUTES ================= */

/* AUTH */
app.use("/api/admin", adminauthRoutes);
app.use("/api/teacher/auth", teacherauthRoutes);

/* ADMIN CORE */
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminAssignRoutes);
app.use("/api/admin", subjectRoutes);

/* STUDENTS */
app.use("/api/students", studentRoutes);              // admin only
app.use("/api/teacher/students", teacherStudentRoutes); // ✅ teacher safe route

/* ATTENDANCE */
app.use("/api/attendance", attendanceRoutes);
app.use("/api/attendance-record", attendancerecordRoutes);

/* NOTIFICATIONS */
app.use("/api/notifications", notificationRoutes);

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= EMAIL API ================= */
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, student, subject, date } = req.body;

    if (!to || !student || !subject || !date) {
      return res.status(400).json({ message: "Missing email data" });
    }

    await transporter.sendMail({
      from: `"Theem College Of Engineering" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Important Attendance Notification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6">
          <h2 style="color:#2c3e50">Attendance Notification</h2>

          <p>Dear Parent / Guardian,</p>

          <p>
            This is to inform you that your ward 
            <b style="color:#000">${student}</b> was marked
            <b style="color:red">ABSENT</b> for the following lecture:
          </p>

          <table style="border-collapse:collapse">
            <tr>
              <td><b>Subject</b></td>
              <td>: ${subject}</td>
            </tr>
            <tr>
              <td><b>Date</b></td>
              <td>: ${date}</td>
            </tr>
          </table>

          <p>
            Regular attendance is essential for academic success, discipline,
            and overall professional growth. We kindly request you to encourage
            your child to attend all scheduled lectures and practical sessions
            without fail.
          </p>

          <p>
            If there is any genuine concern or difficulty, please feel free to
            contact the respective faculty or the college administration.
          </p>

          <p style="margin-top:20px">
            Thank you for your continued support and cooperation.
          </p>

          <p>
            Warm regards,<br/>
            <b>Theem College Of Engineering</b><br/>
            Attendance Monitoring Cell
          </p>
        </div>
      `
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Email Error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ Attendance Management Backend Running Successfully");
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
