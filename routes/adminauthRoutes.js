const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

/* ======================================================
   ADMIN LOGIN (DB BASED – MULTI ROLE)
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 1. Validate input */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    /* 2. Find admin in DB */
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    /* 3. Compare password (model method) */
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    /* 4. Create JWT token (role-based) */
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,      // principal / hod / director / admin
        name: admin.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* 5. Send response */
    res.json({
      token,
      role: admin.role,
      name: admin.name
    });

  } catch (err) {
    console.error("Admin Login Error:", err.message);
    res.status(500).json({
      message: "Admin login failed"
    });
  }
});

module.exports = router;
