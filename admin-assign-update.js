const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");
const assignId = localStorage.getItem("editAssignId");

if (!token || !assignId) location.href = "admin-login.html";

const deptEl = document.getElementById("department");
const subjectEl = document.getElementById("subject");
const msg = document.getElementById("msg");

deptEl.onchange = loadSubjects;

async function loadSubjects() {
    const res = await fetch(`${API}/admin/subjects?department=${deptEl.value}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const subs = await res.json();

    subjectEl.innerHTML = `<option value="">Select Subject</option>`;
    subs.forEach(s => {
        subjectEl.innerHTML += `<option value="${s._id}">${s.name}</option>`;
    });
}

async function updateAssign() {
    const department = deptEl.value;
    const subjectId = subjectEl.value;
    const years = [...document.querySelectorAll("input:checked")].map(i => i.value);

    if (!department || !subjectId || !years.length) {
        msg.style.color = "red";
        msg.innerText = "All fields required";
        return;
    }

    const res = await fetch(`${API}/admin/update-assignment/${assignId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ department, subjectId, years })
    });

    const data = await res.json();

    if (!res.ok) {
        msg.style.color = "red";
        msg.innerText = data.message || "Duplicate assignment blocked ❌";
        return;
    }

    msg.style.color = "green";
    msg.innerText = "Assignment updated successfully ✔";
}
