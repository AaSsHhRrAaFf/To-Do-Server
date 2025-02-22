// File: D:\PH-Assignments\Job-Task\Backend\models\User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  // Add any additional fields you need, such as profile picture, role, etc.
});

module.exports = mongoose.model("User", userSchema);
