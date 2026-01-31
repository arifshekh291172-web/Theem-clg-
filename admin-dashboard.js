/* =========================================
   ADMIN DASHBOARD JS (FINAL – FIXED)
========================================= */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

/* 🔐 AUTH CHECK */
if (!token) {
    window.location.href = "admin-login.html";
}

/* ================= ELEMENTS ================= */
const yearEl = document.getElementById("year");
const deptEl = document.getElementById("department");
const subjectEl = document.getElementById("subject");

const totalStudentsEl = document.getElementById("totalStudents");
const defaultersEl = document.getElementById("defaulters");

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    loadSubjects();
    loadDashboard();

    yearEl.addEventListener("change", loadDashboard);
    deptEl.addEventListener("change", loadDashboard);
    subjectEl.addEventListener("change", loadDashboard);
});

/* ================= LOAD SUBJECTS ================= */
/* BACKEND: GET /api/admin/subjects */
async function loadSubjects() {
    try {
        const res = await fetch(`${API}/admin/subjects`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error();

        const subjects = await res.json();

        subjectEl.innerHTML = `<option value="">All Subjects</option>`;
        subjects.forEach(s => {
            subjectEl.innerHTML += `
                <option value="${s._id}">${s.name}</option>
            `;
        });
    } catch (err) {
        subjectEl.innerHTML = `<option value="">Error loading subjects</option>`;
    }
}

/* ================= LOAD DASHBOARD ================= */
async function loadDashboard() {
    const year = yearEl.value || "";
    const department = deptEl.value || "";
    const subject = subjectEl.value || "";

    /* ================= TOTAL STUDENTS ================= */
    /* BACKEND: GET /api/students */
    try {
        const stuRes = await fetch(
            `${API}/students?year=${year}&department=${department}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!stuRes.ok) throw new Error();

        const students = await stuRes.json();
        totalStudentsEl.innerText = Array.isArray(students)
            ? students.length
            : 0;
    } catch {
        totalStudentsEl.innerText = 0;
    }

    /* ================= DEFAULTERS ================= */
    /* BACKEND: GET /api/attendance-record */
    try {
        const attRes = await fetch(
            `${API}/attendance-record?year=${year}&department=${department}&subject=${subject}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (!attRes.ok) throw new Error();

        const records = await attRes.json();

        /*
          records format:
          [
            {
              records: [
                { student:{_id}, status:"P"/"A" }
              ]
            }
          ]
        */

        const map = {};

        records.forEach(day => {
            day.records.forEach(r => {
                const id = r.student._id;

                if (!map[id]) {
                    map[id] = { total: 0, present: 0 };
                }

                map[id].total++;
                if (r.status === "P") map[id].present++;
            });
        });

        let defaulters = 0;

        Object.values(map).forEach(s => {
            const percent = (s.present / s.total) * 100;
            if (percent < 75) defaulters++;
        });

        defaultersEl.innerText = defaulters;
    } catch {
        defaultersEl.innerText = 0;
    }
}

/* ================= NAVIGATION ================= */
function goDashboard() {
    window.location.href = "admin-dashboard.html";
}

function goStudents() {
    window.location.href = "student-details.html";
}

function goAssign() {
    window.location.href = "admin-assign.html";
}

function goAttendance() {
    window.location.href = "attendance-record.html";
}

function logout() {
    localStorage.removeItem("adminToken");
    window.location.href = "admin-login.html";
}
