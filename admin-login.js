const API = "http://localhost:5000/api";
const btn = document.getElementById("loginBtn");
const errorEl = document.getElementById("error");

btn.addEventListener("click", login);

async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    errorEl.innerText = "";

    if (!email || !password) {
        errorEl.innerText = "Email and password required";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Logging in...";

    try {
        const res = await fetch(`${API}/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.innerText = data.message || "Login failed";
            btn.disabled = false;
            btn.innerText = "Login";
            return;
        }

        /* SAVE ADMIN SESSION */
        localStorage.setItem("adminToken", data.token);

        window.location.href = "admin-dashboard.html";

    } catch (err) {
        errorEl.innerText = "Server not reachable";
        btn.disabled = false;
        btn.innerText = "Login";
    }
}
