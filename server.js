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

/* SUBJECTS (ADMIN) */
const subjectRoutes = require("./routes/subjectRoutes");

/* STUDENTS (ADMIN ONLY) */
const studentRoutes = require("./routes/studentRoutes");

/* ✅ STUDENTS (TEACHER SAFE ROUTE) */
const teacherstudentRoutes = require("./routes/teacherStudentRoutes");

/* ATTENDANCE */
const attendanceRoutes = require("./routes/attendanceRoutes");
const attendancerecordRoutes = require("./routes/attendancerecordRoutes");

/* NOTIFICATIONS */
const notificationRoutes = require("./routes/notificationRoutes");

/* ================= USE ROUTES ================= */

/* AUTH */
app.use("/api/admin", adminauthRoutes);
app.use("/api/teacher", teacherauthRoutes);

/* ADMIN CORE (teachers CRUD) */
app.use("/api/admin", adminRoutes);

/* ADMIN ASSIGN */
app.use("/api/admin", adminAssignRoutes);

/* SUBJECTS */
app.use("/api/admin", subjectRoutes);

/* STUDENTS */
app.use("/api/students", StudentRoutes); // admin only
app.use("/api/teacher", teacherStudentRoutes); // ✅ teacher access

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
      subject: "Student Absence Alert",
      html: `
        <h3>Attendance Notification</h3>
        <p>Your child <b>${student}</b> was 
           <b style="color:red">ABSENT</b>.</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Date:</b> ${date}</p>
        <br>
        <p>— Theem College Of Engineering</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email Error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ Attendance Management Backend Running");
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    message: "Internal Server Error"
  });
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
