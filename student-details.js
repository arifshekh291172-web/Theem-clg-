/* =====================================================
   ADMIN STUDENT MANAGEMENT – FULL FINAL VERSION
   ✔ Backend strict-mode compatible
   ✔ className used everywhere (NOT year)
   ✔ XLSX attendance sheet supported
===================================================== */

const API = "http://localhost:5000/api/students";
const token = localStorage.getItem("adminToken");

/* ================= AUTH CHECK ================= */
if (!token) {
    window.location.href = "admin-login.html";
}

/* ================= GLOBAL STATE ================= */
let selectedStudentId = null;

/* ================= DOM ELEMENTS ================= */
const tbody = document.getElementById("tbody");
const filterDept = document.getElementById("filterDept");
const filterYear = document.getElementById("filterYear"); // FY / SY / TY
const fileInput = document.getElementById("fileInput");

/* ================= LOAD STUDENTS ================= */
async function loadStudents() {
    let url = API;
    const params = [];

    if (filterDept.value) {
        params.push(`department=${encodeURIComponent(filterDept.value)}`);
    }
    if (filterYear.value) {
        // IMPORTANT: backend expects className
        params.push(`className=${encodeURIComponent(filterYear.value)}`);
    }

    if (params.length) {
        url += "?" + params.join("&");
    }

    try {
        const res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch students");
        }

        const students = await res.json();
        tbody.innerHTML = "";

        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center">
                        No students found
                    </td>
                </tr>
            `;
            return;
        }

        students.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.rollNo || "-"}</td>
                    <td>${s.name || "-"}</td>
                    <td>
                        ${
                            s.parentEmail
                                ? s.parentEmail
                                : `<button onclick="openEmailModal('${s._id}')">
                                       Add Email
                                   </button>`
                        }
                    </td>
                    <td>${s.department || "-"}</td>
                    <td>${s.className || "-"}</td>
                    <td>
                        <button class="btn-danger"
                            onclick="deleteStudent('${s._id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Error loading students");
    }
}

/* ================= FILTER EVENTS ================= */
filterDept.addEventListener("change", loadStudents);
filterYear.addEventListener("change", loadStudents);

/* ================= INITIAL LOAD ================= */
loadStudents();

/* =====================================================
   XLSX / CSV UPLOAD (ATTENDANCE SHEET)
   Expected sheet:
   Row 6 onwards
   Col A = Roll No
   Col B = Student Name
===================================================== */
async function uploadFile() {
    const file = fileInput.files[0];

    if (!file || !filterDept.value || !filterYear.value) {
        alert("Department, Year aur file select karo");
        return;
    }

    let added = 0;
    let skipped = 0;

    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rows || rows.length < 6) {
            alert("Invalid / empty attendance sheet");
            return;
        }

        // Data starts from row index 5
        for (let i = 5; i < rows.length; i++) {
            const rollNo = rows[i][0];
            const name = rows[i][1];

            if (!rollNo || !name) {
                skipped++;
                continue;
            }

            const res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    rollNo: String(rollNo).trim(),
                    name: String(name).trim(),
                    department: filterDept.value,
                    className: filterYear.value // 🔥 MOST IMPORTANT
                })
            });

            if (res.ok) {
                added++;
            } else {
                skipped++;
            }
        }

        alert(`Upload Completed ✅
Added: ${added}
Skipped: ${skipped}`);

        loadStudents();

    } catch (err) {
        console.error(err);
        alert("Upload failed");
    }
}

/* =====================================================
   ADD STUDENT (MANUAL)
===================================================== */
function openAddStudent() {
    document.getElementById("studentModal").style.display = "flex";
}

function closeStudentModal() {
    document.getElementById("studentModal").style.display = "none";
}

async function saveStudent() {
    const rollNo = document.getElementById("rollNo").value.trim();
    const name = document.getElementById("name").value.trim();
    const department = filterDept.value;
    const className = filterYear.value;

    if (!rollNo || !name || !department || !className) {
        alert("All fields required");
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                rollNo,
                name,
                department,
                className
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        closeStudentModal();
        loadStudents();

    } catch (err) {
        console.error(err);
        alert(err.message || "Failed to add student");
    }
}

/* =====================================================
   PARENT EMAIL MODAL
===================================================== */
function openEmailModal(id) {
    selectedStudentId = id;
    document.getElementById("emailModal").style.display = "flex";
}

function closeEmailModal() {
    document.getElementById("emailModal").style.display = "none";
}

async function saveParentEmail() {
    const email = document.getElementById("parentEmailInput").value.trim();
    if (!email) return;

    try {
        const res = await fetch(`${API}/${selectedStudentId}/parent-email`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ parentEmail: email })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        closeEmailModal();
        loadStudents();

    } catch (err) {
        console.error(err);
        alert("Failed to update email");
    }
}

/* =====================================================
   DELETE STUDENT
===================================================== */
async function deleteStudent(id) {
    if (!confirm("Delete student?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        loadStudents();

    } catch (err) {
        console.error(err);
        alert("Failed to delete student");
    }
}
