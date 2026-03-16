const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DEPARTMENT_VALUES = ["FCE", "FET", "FDA", "FMC", "FSH", "FPA", "FPH", "PIHM", "FIRE"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minLength: 6 },
    department: { type: String, required: true, enum: DEPARTMENT_VALUES },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.DEPARTMENT_VALUES = DEPARTMENT_VALUES;
