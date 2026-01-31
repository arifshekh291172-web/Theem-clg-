require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");

async function createAdmins() {
  await mongoose.connect(process.env.MONGO_URI);

  const admins = [
    {
      name: "Dr. S. layak Principal",
      email: "principal@theemcoe.com",
      password: "Principal@123",
      role: "principal"
    },
    {
      name: "Prof. Abid M. HOD",
      email: "hod.cse@theemcoe.com",
      password: "Hod@123",
      role: "hod",
      department: "CSE"
    },
    {
      name: "Mr. NK Rana Director",
      email: "director@theemcoe.com",
      password: "Director@123",
      role: "director"
    }
  ];

  for (const a of admins) {
    const exists = await Admin.findOne({ email: a.email });
    if (!exists) {
      await Admin.create(a);
      console.log(`Created: ${a.role} → ${a.email}`);
    } else {
      console.log(`Already exists: ${a.email}`);
    }
  }

  process.exit();
}

createAdmins();
