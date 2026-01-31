const express = require("express");
const router = express.Router();

const { loginTeacher } = require("../controllers/teacherController");

router.post("/login", loginTeacher);

module.exports = router;
