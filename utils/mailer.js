const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendAbsentMail = async (parentEmail, studentName, date, subject) => {
    await transporter.sendMail({
        from: `"Attendance System" <${process.env.EMAIL_USER}>`,
        to: parentEmail,
        subject: "Student Absence Notification",
        html: `
      <p>Dear Parent,</p>
      <p>Your ward <b>${studentName}</b> was <b>ABSENT</b> on <b>${date}</b>
      for subject <b>${subject}</b>.</p>
      <p>Please contact the college if required.</p>
      <br>
      <p>Theem College of Engineering</p>
    `
    });
};
