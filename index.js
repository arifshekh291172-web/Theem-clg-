// index.js
// Landing Page Navigation Logic

document.addEventListener("DOMContentLoaded", () => {

  const enrollmentBtn = document.getElementById("studentEnrollment");

  if (enrollmentBtn) {
    enrollmentBtn.addEventListener("click", () => {
      window.location.href = "admin-dashboard.html";
    });
  }

});
