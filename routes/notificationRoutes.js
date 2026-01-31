const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

/* CREATE LOG */
router.post("/", async (req, res) => {
  try {
    const n = await Notification.create(req.body);
    res.json(n);
  } catch (e) {
    res.status(400).json({ message: "Notification failed" });
  }
});

/* READ ALL */
router.get("/", async (req, res) => {
  const list = await Notification.find()
    .populate("student")
    .sort({ createdAt: -1 });
  res.json(list);
});

module.exports = router;
