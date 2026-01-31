/* ======================================
   CREATE TEACHER (ADMIN)
====================================== */

const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) {
    location.href = "admin-login.html";
}

async function createTeacher() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const msg = document.getElementById("msg");
    msg.innerText = "";

    if (!name || !email || !password) {
        msg.style.color = "red";
        msg.innerText = "All fields are required";
        return;
    }

    if (password.length < 6) {
        msg.style.color = "red";
        msg.innerText = "Password must be at least 6 characters";
        return;
    }

    try {
        const res = await fetch(`${API}/admin/teachers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Teacher creation failed");
        }

        msg.style.color = "green";
        msg.innerText = "Teacher created successfully ✔";

        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

    } catch (err) {
        msg.style.color = "red";
        msg.innerText = err.message;
    }
}

/* NAV */
function goDashboard() {
    location.href = "admin-dashboard.html";
}

function goTeachers() {
    location.href = "admin-assigned-teachers.html";
}

function logout() {
    localStorage.removeItem("adminToken");
    location.href = "admin-login.html";
}
