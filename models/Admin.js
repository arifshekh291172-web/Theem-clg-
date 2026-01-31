const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/*
  Admin Roles:
  - admin      → full system access
  - hod        → department-level access
  - principal  → academic oversight
  - director   → full institute access
*/

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["principal", "hod", "director", "admin"],
      default: "admin"
    },

    /* Optional – for HOD role */
    department: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // createdAt & updatedAt
  }
);

/* =====================================================
   PASSWORD HASH (SECURE – PRE SAVE)
   ===================================================== */
adminSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/* =====================================================
   PASSWORD COMPARE METHOD
   ===================================================== */
adminSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

/* =====================================================
   REMOVE PASSWORD FROM JSON RESPONSE
   ===================================================== */
adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Admin", adminSchema);
