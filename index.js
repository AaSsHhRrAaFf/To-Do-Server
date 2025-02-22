
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Task = require("./models/Task");
const User = require("./models/User");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());




// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// WebSocket Connection
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => console.log("User disconnected"));
});

// Routes
app.get("/", (req, res) => res.send("Welcome to the API!"));

app.post("/users", async (req, res) => {
  try {
    const { uid, email, displayName } = req.body;
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }
    const user = new User({ uid, email, displayName });
    await user.save();
    res.status(201).json({ message: "User stored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/tasks/reorder", async (req, res) => {
  try {
    const { tasks } = req.body;
    const bulkOps = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: { $set: { category: task.category, order: task.order } },
      },
    }));
    await Task.bulkWrite(bulkOps);
    io.emit("tasksUpdated", tasks); // Broadcast to all clients
    res.status(200).json({ message: "Tasks reordered successfully" });
  } catch (error) {
    console.error("Error reordering tasks:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ category: 1, order: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/tasks/:id",  async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/tasks/:id",  async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
