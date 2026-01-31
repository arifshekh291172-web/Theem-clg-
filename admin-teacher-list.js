/* ======================================
   ADMIN TEACHER LIST + DELETE + RESET
====================================== */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) location.href = "admin-login.html";

const tbody = document.getElementById("teacherBody");

/* ================= LOAD TEACHERS ================= */
async function loadTeachers() {
    const res = await fetch(`${API}/admin/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const teachers = await res.json();
    tbody.innerHTML = "";

    teachers.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.name}</td>
                <td>${t.email}</td>
                <td>
                    <button class="action-btn reset"
                        onclick="resetPassword('${t._id}')">
                        Reset Password
                    </button>
                    <button class="action-btn delete"
                        onclick="deleteTeacher('${t._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

/* ================= DELETE TEACHER ================= */
async function deleteTeacher(id) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    const res = await fetch(`${API}/admin/delete-teacher/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
        alert("Failed to delete teacher");
        return;
    }

    loadTeachers();
}

/* ================= RESET PASSWORD ================= */
async function resetPassword(id) {
    const newPass = prompt("Enter new password (min 6 characters):");
    if (!newPass || newPass.length < 6) {
        alert("Invalid password");
        return;
    }

    const res = await fetch(`${API}/admin/reset-teacher-password/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPass })
    });

    if (!res.ok) {
        alert("Password reset failed");
        return;
    }

    alert("Password reset successfully ✔");
}

/* ================= NAV ================= */
function goDashboard() {
    location.href = "admin-dashboard.html";
}

function logout() {
    localStorage.removeItem("adminToken");
    location.href = "admin-login.html";
}

/* INIT */
loadTeachers();
