/* =========================================
   ATTENDANCE RECORD JS (ADMIN FINAL)
========================================= */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

/* 🔐 AUTH CHECK */
if (!token) {
    location.href = "admin-login.html";
}

/* ================= DOM ================= */
const departmentEl = document.getElementById("department");
const yearEl = document.getElementById("year");
const subjectEl = document.getElementById("subject");
const monthEl = document.getElementById("month");

const searchEl = document.getElementById("search");
const defOnlyEl = document.getElementById("defOnly");

const headEl = document.getElementById("head");
const bodyEl = document.getElementById("body");

const totalStudentsEl = document.getElementById("totalStudents");
const avgPercentEl = document.getElementById("avgPercent");
const defaulterCountEl = document.getElementById("defaulterCount");

/* ================= STATE ================= */
let currentRecords = [];

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    departmentEl.onchange = loadSubjects;
    yearEl.onchange = loadSubjects;
    subjectEl.onchange = loadRecords;

    searchEl.onkeyup = applyFilters;
    defOnlyEl.onchange = applyFilters;
});

/* ================= LOAD SUBJECTS (DB) ================= */
/* ================= LOAD SUBJECTS (ADMIN) ================= */
async function loadSubjects() {
    subjectEl.innerHTML = `<option value="">Select Subject</option>`;

    if (!departmentEl.value || !yearEl.value) return;

    try {
        const res = await fetch(
            `${API}/admin/subjects?department=${departmentEl.value}&year=${yearEl.value}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            throw new Error("Failed to load subjects");
        }

        const subjects = await res.json();

        subjects.forEach(s => {
            subjectEl.innerHTML += `
                <option value="${s._id}">${s.name}</option>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Subjects load nahi ho rahe. Server / route check karo.");
    }
}


/* ================= LOAD ATTENDANCE ================= */
async function loadRecords() {
    if (!departmentEl.value || !yearEl.value || !subjectEl.value) return;

    try {
        const res = await fetch(
            `${API}/attendance-record?department=${departmentEl.value}&className=${yearEl.value}&subject=${subjectEl.value}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!res.ok) {
            const err = await res.json();
            console.error("API Error:", err);
            alert(err.message || "Attendance record load nahi ho raha");
            return;
        }

        currentRecords = await res.json();

        if (!Array.isArray(currentRecords) || currentRecords.length === 0) {
            console.warn("No attendance data found");
            renderTable([]);
            return;
        }

        console.log("Attendance Records:", currentRecords);
        renderTable(currentRecords);

    } catch (error) {
        console.error("Fetch Failed:", error);
        alert("Server se connection nahi ho raha");
    }
}


/* ================= RENDER TABLE ================= */
function renderTable(records) {
    headEl.innerHTML = "";
    bodyEl.innerHTML = "";

    if (!records.length) {
        totalStudentsEl.innerText = 0;
        avgPercentEl.innerText = "0%";
        defaulterCountEl.innerText = 0;
        return;
    }

    /* ONLY TEACHER ENTERED DATES */
    const dates = [...new Set(records.map(r => r.date))]
        .sort((a, b) => new Date(a) - new Date(b));

    /* STUDENT MAP */
    const map = {};

    records.forEach(day => {
        day.records.forEach(r => {
            const id = r.student._id;
            if (!map[id]) {
                map[id] = {
                    roll: r.student.rollNo,
                    name: r.student.name,
                    attendance: {}
                };
            }
            map[id].attendance[day.date] = r.status;
        });
    });

    const students = Object.values(map);

    /* TABLE HEAD */
    headEl.innerHTML = `
        <th>Roll</th>
        <th>Name</th>
    `;
    dates.forEach(d => {
        headEl.innerHTML += `<th>${formatDate(d)}</th>`;
    });
    headEl.innerHTML += `<th>%</th><th>Status</th>`;

    /* TABLE BODY */
    let totalPercent = 0;
    let defaulters = 0;

    students.forEach(stu => {
        let present = 0;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${stu.roll}</td>
            <td>${stu.name}</td>
        `;

        dates.forEach(d => {
            const status = stu.attendance[d] || "A";
            if (status === "P") present++;

            tr.innerHTML += `
                <td class="${status === "P" ? "present" : "absent"}">
                    ${status}
                </td>
            `;
        });

        const percent = Math.round((present / dates.length) * 100);
        totalPercent += percent;

        if (percent < 75) {
            tr.classList.add("defaulter-row");
            defaulters++;
        }

        tr.innerHTML += `
            <td class="${percent < 75 ? "percent-bad" : "percent-good"}">
                ${percent}%
            </td>
            <td>${percent < 75 ? "Defaulter" : "Regular"}</td>
        `;

        bodyEl.appendChild(tr);
    });

    totalStudentsEl.innerText = students.length;
    avgPercentEl.innerText =
        Math.round(totalPercent / students.length) + "%";
    defaulterCountEl.innerText = defaulters;

    applyFilters();
}

/* ================= FILTER ================= */
function applyFilters() {
    const q = searchEl.value.toLowerCase();
    const onlyDef = defOnlyEl.checked;

    [...bodyEl.rows].forEach(r => {
        const txt = r.innerText.toLowerCase();
        const isDef = r.classList.contains("defaulter-row");
        r.style.display =
            txt.includes(q) && (!onlyDef || isDef) ? "" : "none";
    });
}

/* ================= MONTHLY SUMMARY ================= */
function generateMonthlySummary() {
    if (!monthEl.value) {
        alert("Select Month");
        return;
    }

    let lectures = 0;
    const map = {};

    currentRecords.forEach(day => {
        const m = String(new Date(day.date).getMonth() + 1).padStart(2, "0");
        if (m !== monthEl.value) return;

        lectures++;

        day.records.forEach(r => {
            const id = r.student._id;
            if (!map[id]) map[id] = { t: 0, p: 0 };
            map[id].t++;
            if (r.status === "P") map[id].p++;
        });
    });

    let defaulters = 0;
    let avg = 0;

    Object.values(map).forEach(s => {
        const per = (s.p / s.t) * 100;
        avg += per;
        if (per < 75) defaulters++;
    });

    avg = Object.keys(map).length
        ? Math.round(avg / Object.keys(map).length)
        : 0;

    alert(
        `📅 Monthly Summary\n\nLectures: ${lectures}\nStudents: ${Object.keys(map).length}\nAverage: ${avg}%\nDefaulters: ${defaulters}`
    );
}

/* ================= SUBJECT EXCEL ================= */
function exportSubjectExcel() {
    if (!currentRecords.length) return alert("No data");

    const dates = [...new Set(currentRecords.map(r => r.date))];
    const map = {};

    currentRecords.forEach(day => {
        day.records.forEach(r => {
            const id = r.student._id;
            if (!map[id]) {
                map[id] = {
                    Roll: r.student.rollNo,
                    Name: r.student.name
                };
            }
            map[id][formatDate(day.date)] = r.status;
        });
    });

    const rows = Object.values(map);

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(
        wb,
        `Attendance_${subjectEl.options[subjectEl.selectedIndex].text}.xlsx`
    );
}

/* ================= FULL EXCEL ================= */
function exportExcel() {
    const wb = XLSX.utils.table_to_book(
        document.getElementById("table"),
        { sheet: "Attendance" }
    );
    XLSX.writeFile(wb, "Attendance_Register.xlsx");
}

/* ================= DATE FORMAT ================= */
function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB");
}
