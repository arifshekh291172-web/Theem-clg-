/* ================= ADMIN SUBJECT ================= */

const API = "http://localhost:5000/api/admin/subjects";
const token = localStorage.getItem("adminToken");

if (!token) location.href = "admin-login.html";

const tbody = document.getElementById("tbody");
const msg = document.getElementById("msg");

/* ================= ADD SUBJECT ================= */
async function addSubject() {
  const name = document.getElementById("name").value.trim();
  const department = document.getElementById("department").value;
  const years = [...document.querySelectorAll(".years input:checked")]
    .map(c => c.value);

  msg.innerText = "";

  if (!name || !department || !years.length) {
    msg.style.color = "red";
    msg.innerText = "All fields required";
    return;
  }

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, department, years })
  });

  const data = await res.json();

  if (!res.ok) {
    msg.style.color = "red";
    msg.innerText = data.message || "Failed to add subject";
    return;
  }

  msg.style.color = "green";
  msg.innerText = "Subject added successfully";

  loadSubjects();
}

/* ================= LOAD SUBJECTS ================= */
async function loadSubjects() {
  const res = await fetch(API, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const subjects = await res.json();

  tbody.innerHTML = "";

  subjects.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.department}</td>
        <td>${s.years.join(", ")}</td>
        <td>
          <button onclick="deleteSubject('${s._id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* ================= DELETE SUBJECT ================= */
async function deleteSubject(id) {
  if (!confirm("Delete subject?")) return;

  await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  loadSubjects();
}

/* INIT */
loadSubjects();
