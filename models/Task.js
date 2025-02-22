const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 50 },
  description: { type: String, maxLength: 200 },
  category: {
    type: String,
    enum: ["To-Do", "In Progress", "Done"],
    default: "To-Do",
  },
  order: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, required: true },
});

module.exports = mongoose.model("Task", taskSchema);
