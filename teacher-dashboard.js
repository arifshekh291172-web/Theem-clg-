/* =========================================
   TEACHER DASHBOARD JS (FINAL)
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= AUTH CHECK ================= */
    const token = localStorage.getItem("teacherToken");
    if (!token) {
        window.location.href = "teacher-login.html";
        return;
    }

    /* ================= ASSIGNED DATA ================= */
    const teacherDepartment = localStorage.getItem("teacherDepartment");
    const teacherSubject = localStorage.getItem("teacherSubject");
    const teacherYears = JSON.parse(localStorage.getItem("teacherYears") || "[]");

    /* ================= ELEMENTS ================= */
    const deptEl = document.getElementById("dept");
    const subjectEl = document.getElementById("subject");
    const yearEl = document.getElementById("year");

    const lecturesEl = document.getElementById("lectures");
    const defaultersEl = document.getElementById("defaulters");
    const recordBody = document.getElementById("recordBody");

    const markAttendanceBtn = document.getElementById("markAttendanceBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    /* ================= INIT FILTERS ================= */
    if (deptEl) {
        deptEl.innerHTML = `<option>${teacherDepartment || "Not Assigned"}</option>`;
        deptEl.disabled = true;
    }

    if (subjectEl) {
        subjectEl.innerHTML = `<option>${teacherSubject || "Not Assigned"}</option>`;
        subjectEl.disabled = true;
    }

    if (yearEl) {
        yearEl.innerHTML = `<option value="">Select Year</option>`;
        teacherYears.forEach(y => {
            yearEl.innerHTML += `<option value="${y}">${y}</option>`;
        });
    }

    /* ================= DASHBOARD DATA ================= */
    function loadDashboard() {
        const selectedYear = yearEl.value;
        if (!selectedYear) return;

        recordBody.innerHTML = "";
        let lectureCount = 0;
        const defaulterSet = new Set();

        Object.keys(localStorage).forEach(key => {
            if (!key.startsWith("attendance_")) return;

            const students = JSON.parse(localStorage.getItem(key)) || [];

            students.forEach(stu => {
                if (
                    stu.department === teacherDepartment &&
                    stu.subject === teacherSubject &&
                    stu.year === selectedYear
                ) {
                    const attendance = stu.attendance || {};
                    const total = Object.keys(attendance).length;
                    if (!total) return;

                    const present = Object.values(attendance)
                        .filter(v => v === "P").length;

                    lectureCount = total;

                    const percent = Math.round((present / total) * 100);
                    if (percent < 75) defaulterSet.add(stu.roll);

                    recordBody.innerHTML += `
                        <tr>
                            <td>${stu.roll}</td>
                            <td>${stu.name}</td>
                            <td>${percent}%</td>
                            <td>${percent < 75 ? "Defaulter" : "Regular"}</td>
                        </tr>
                    `;
                }
            });
        });

        lecturesEl.innerText = lectureCount;
        defaultersEl.innerText = defaulterSet.size;
    }

    if (yearEl) {
        yearEl.addEventListener("change", loadDashboard);
    }

    /* ================= MARK ATTENDANCE ================= */
    if (markAttendanceBtn) {
        markAttendanceBtn.addEventListener("click", () => {

            /*
              🔥 IMPORTANT PART
              Students ko Mark Attendance page ke liye prepare karna
            */

            // 🔹 ALL students (ye admin/student page se save hone chahiye)
            const allStudents = JSON.parse(
                localStorage.getItem("allStudents")
            ) || [];

            // 🔹 Filter based on assigned class
            const filteredStudents = allStudents.filter(s =>
                s.department === teacherDepartment &&
                s.subject === teacherSubject &&
                teacherYears.includes(s.year)
            );

            // 🔹 SAVE for mark-attendance.js
            localStorage.setItem(
                "students",
                JSON.stringify(filteredStudents)
            );

            // 🔒 Lock class info
            localStorage.setItem("lockDept", teacherDepartment);
            localStorage.setItem("lockSubject", teacherSubject);
            localStorage.setItem(
                "lockYears",
                JSON.stringify(teacherYears)
            );

            window.location.href = "mark-attendance.html";
        });
    }

    /* ================= LOGOUT ================= */
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("teacherToken");
            localStorage.removeItem("lockDept");
            localStorage.removeItem("lockSubject");
            localStorage.removeItem("lockYears");
            localStorage.removeItem("students");

            window.location.href = "teacher-login.html";
        });
    }

});
