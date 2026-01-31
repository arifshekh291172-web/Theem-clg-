/* =====================================
   MARK ATTENDANCE JS (DB BASED - FINAL)
===================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* ================= AUTH CHECK ================= */
    const token = localStorage.getItem("teacherToken");
    if (!token) {
        window.location.href = "teacher-login.html";
        return;
    }

    /* ================= LOCKED DATA ================= */
    const department = localStorage.getItem("lockDept");
    const subject = localStorage.getItem("lockSubject");
    const years = JSON.parse(localStorage.getItem("lockYears") || "[]");
    const year = years[0] || "";

    /* ================= UI ================= */
    document.getElementById("deptText").innerText = department || "-";
    document.getElementById("subjectText").innerText = subject || "-";
    document.getElementById("yearText").innerText = year || "-";

    const dateInput = document.getElementById("date");
    dateInput.value = new Date().toISOString().split("T")[0];

    const tbody = document.getElementById("studentRows");

    /* ================= FETCH STUDENTS (TEACHER ROUTE) ================= */
    let students = [];

    try {
        const url = `http://localhost:5000/api/teacher/students?department=${encodeURIComponent(
            department
        )}&className=${encodeURIComponent(year)}`;

        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Forbidden");
        }

        const data = await res.json();

        students = data.map(s => ({
            roll: s.rollNo,
            name: s.name,
            parentEmail: s.parentEmail || ""
        }));

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="color:red;font-weight:600">
                    Failed to load students
                </td>
            </tr>
        `;
        return;
    }

    /* ================= RENDER STUDENTS ================= */
    if (!students.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="color:#dc2626;font-weight:600">
                    No students found
                </td>
            </tr>
        `;
    } else {
        students.forEach((s, i) => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.roll}</td>
                    <td class="name-col">${s.name}</td>
                    <td><input type="radio" name="att_${i}" value="P"></td>
                    <td><input type="radio" name="att_${i}" value="A"></td>
                </tr>
            `;
        });
    }

    /* ================= NAME TOGGLE ================= */
    window.toggleNames = function () {
        const cols = document.querySelectorAll(".name-col");
        const btn = document.querySelector(".btn-secondary");

        const hidden = cols[0]?.style.display === "none";

        cols.forEach(td => {
            td.style.display = hidden ? "table-cell" : "none";
        });

        if (btn) btn.innerText = hidden ? "Hide Names" : "Show Names";
    };

    /* ================= SUBMIT ATTENDANCE ================= */
    window.submitAttendance = async function () {

        const selectedDate = dateInput.value;
        if (!selectedDate) {
            alert("Please select lecture date");
            return;
        }

        const [y, m, d] = selectedDate.split("-");
        const formattedDate = `${d}-${m}-${y}`;

        const storageKey = `attendance_${department}_${year}_${subject}`;
        const old = JSON.parse(localStorage.getItem(storageKey)) || [];

        /* 🔴 ABSENT STUDENTS FOR EMAIL */
        const absentStudents = [];

        for (let i = 0; i < students.length; i++) {
            const selected = document.querySelector(
                `input[name="att_${i}"]:checked`
            );

            if (!selected) {
                alert("Please mark attendance for all students");
                return;
            }

            let record = old.find(r => r.roll === students[i].roll);

            if (!record) {
                record = {
                    roll: students[i].roll,
                    name: students[i].name,
                    department,
                    year,
                    subject,
                    attendance: {}
                };
                old.push(record);
            }

            record.attendance[formattedDate] = selected.value;

            /* 🔴 IF ABSENT → COLLECT FOR EMAIL */
            if (
                selected.value === "A" &&
                students[i].parentEmail
            ) {
                absentStudents.push({
                    parentEmail: students[i].parentEmail,
                    student: students[i].name
                });
            }
        }

        /* SAVE ATTENDANCE */
        localStorage.setItem(storageKey, JSON.stringify(old));

        /* ================= SEND EMAILS ================= */
        for (const a of absentStudents) {
            fetch("http://localhost:5000/api/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    to: a.parentEmail,
                    student: a.student,
                    subject,
                    date: formattedDate
                })
            }).catch(err => {
                console.warn("Email failed for:", a.student);
            });
        }

        alert("Attendance submitted successfully ✅");
        window.location.href = "teacher-dashboard.html";
    };


    /* ================= LOGOUT ================= */
    window.logout = function () {
        localStorage.removeItem("teacherToken");
        localStorage.removeItem("lockDept");
        localStorage.removeItem("lockSubject");
        localStorage.removeItem("lockYears");

        window.location.href = "teacher-login.html";
    };

});
