/* =========================================
   ADMIN ASSIGN TEACHER - FINAL (FIXED)
========================================= */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) {
    alert("Admin not logged in");
    location.href = "admin-login.html";
}

/* ===============================
   DOM ELEMENTS
================================ */
const teacherSelect = document.getElementById("teacherSelect");
const subjectSelect = document.getElementById("subjectSelect");
const departmentSelect = document.getElementById("department");
const assignBtn = document.getElementById("assignBtn");
const msg = document.getElementById("msg");

/* ===============================
   LOAD TEACHERS
================================ */
async function loadTeachers() {
    try {
        const res = await fetch(`${API}/admin/teachers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const teachers = await res.json();

        teacherSelect.innerHTML = `<option value="">Select Teacher</option>`;
        teachers.forEach(t => {
            teacherSelect.innerHTML += `
                <option value="${t._id}">${t.email}</option>
            `;
        });
    } catch (err) {
        console.error(err);
        msg.style.color = "red";
        msg.innerText = "Failed to load teachers";
    }
}

/* ===============================
   LOAD SUBJECTS
================================ */
async function loadSubjects() {
    try {
        const res = await fetch(`${API}/admin/subjects`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const subjects = await res.json();

        subjectSelect.innerHTML = `<option value="">Select Subject</option>`;
        subjects.forEach(s => {
            subjectSelect.innerHTML += `
                <option value="${s._id}">${s.name}</option>
            `;
        });
    } catch (err) {
        console.error(err);
        msg.style.color = "red";
        msg.innerText = "Failed to load subjects";
    }
}

/* ===============================
   ASSIGN TEACHER (MAIN)
================================ */
async function assignTeacher() {

    msg.innerText = "";

    const teacherId = teacherSelect.value;
    const department = departmentSelect.value;
    const subjectId = subjectSelect.value;

    const years = Array.from(
        document.querySelectorAll(".years input[type='checkbox']:checked")
    ).map(cb => cb.value);

    /* VALIDATION */
    if (!teacherId || !department || !subjectId || years.length === 0) {
        msg.style.color = "red";
        msg.innerText = "Please select all fields";
        return;
    }

    try {
        const res = await fetch(`${API}/admin/assign-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                teacherId,
                department,
                subjectId,
                years
            })
        });

        const data = await res.json();

        if (!res.ok) {
            msg.style.color = "red";
            msg.innerText = data.message || "Assignment failed";
            return;
        }

        msg.style.color = "green";
        msg.innerText = "Teacher assigned successfully ✔";

        /* RESET FORM */
        teacherSelect.value = "";
        departmentSelect.value = "";
        subjectSelect.value = "";
        document
            .querySelectorAll(".years input[type='checkbox']")
            .forEach(cb => cb.checked = false);

    } catch (err) {
        console.error(err);
        msg.style.color = "red";
        msg.innerText = "Server not reachable";
    }
}

/* ===============================
   BUTTON CLICK FIX 🔥
================================ */
assignBtn.addEventListener("click", assignTeacher);

/* ===============================
   INIT
================================ */
loadTeachers();
loadSubjects();
