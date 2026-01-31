const API = "http://localhost:5000/api";
const token = localStorage.getItem("adminToken");

if (!token) location.href = "admin-login.html";

const listBody = document.getElementById("listBody");

async function loadAssignedTeachers() {
    const res = await fetch(`${API}/admin/assigned-teachers`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    listBody.innerHTML = "";

    data.forEach(a => {
        listBody.innerHTML += `
        <tr>
            <td>${a.teacher.email}</td>
            <td>${a.department}</td>
            <td>${a.subject.name}</td>
            <td>${a.years.join(", ")}</td>
            <td>
                <button onclick="editAssign('${a._id}')">Edit</button>
            </td>
        </tr>`;
    });
}

function editAssign(id) {
    localStorage.setItem("editAssignId", id);
    location.href = "admin-assign-update.html";
}

loadAssignedTeachers();
