const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  parentEmail: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  date: {
    type: String
  },
  type: {
    type: String,
    enum: ["EMAIL", "SMS"],
    default: "EMAIL"
  },
  status: {
    type: String,
    enum: ["SENT", "FAILED"],
    default: "SENT"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
