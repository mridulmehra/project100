const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const supabase = require("./supabaseClient");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ Utility Function for Error Handling
const handleError = (res, error) => res.status(500).json({ error: error.message });

// 📌 USERS API

// 🟢 Get All Users
app.get("/users", async (req, res) => {
    const { data, error } = await supabase.from("users").select("id, name, email, avatar_url, created_at");
    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Get a Specific User by ID
app.get("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, created_at")
        .eq("id", id)
        .single();

    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Create a User
app.post("/users", async (req, res) => {
    const { name, email, password, avatar_url } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from("users")
            .insert([{ name, email, password: hashedPassword, avatar_url }])
            .select("id, name, email, avatar_url");

        if (error) return handleError(res, error);
        res.json(data[0]);
    } catch (err) {
        res.status(500).json({ error: "Error hashing password" });
    }
});

// 🟢 User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const { data, error } = await supabase
        .from("users")
        .select("id, name, email, password")
        .eq("email", email)
        .single();

    if (error || !data) return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful", user: { id: data.id, name: data.name, email: data.email } });
});

// 🟢 Update a User
app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const { data, error } = await supabase.from("users").update({ name, email }).eq("id", id).select();
    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Delete a User
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return handleError(res, error);
    res.json({ message: "User deleted successfully" });
});

// 📌 PROJECTS API

// 🟢 Get All Projects
app.get("/projects", async (req, res) => {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Create a Project
app.post("/projects", async (req, res) => {
    const { name, description, owner_id } = req.body;

    if (!name || !owner_id) {
        return res.status(400).json({ error: "Project name and owner_id are required." });
    }

    const { data, error } = await supabase
        .from("projects")
        .insert([{ name, description, owner_id }])
        .select();

    if (error) return handleError(res, error);
    res.json(data);
});

// 📌 TASKS API

// 🟢 Get All Tasks
app.get("/tasks", async (req, res) => {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Create a Task (With Security Check)
app.post("/tasks", async (req, res) => {
    const { title, description, status_id, project_id, assigned_to, user_id } = req.body;

    if (!title || !status_id || !project_id || !user_id) {
        return res.status(400).json({ error: "Title, status_id, project_id, and user_id are required." });
    }

    // 🔐 Ensure only project members can create tasks
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", project_id)
        .single();

    if (projectError || !project || project.owner_id !== user_id) {
        return res.status(403).json({ error: "You are not authorized to create tasks in this project" });
    }

    const { data, error } = await supabase
        .from("tasks")
        .insert([{ title, description, status_id, project_id, assigned_to }])
        .select();

    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Update a Task (With Authorization Check)
app.put("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, status_id, assigned_to, user_id } = req.body;

    // 🔐 Ensure only assigned user can update the task
    const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("assigned_to")
        .eq("id", id)
        .single();

    if (taskError || !task) return res.status(404).json({ error: "Task not found" });

    if (task.assigned_to !== user_id) {
        return res.status(403).json({ error: "You are not allowed to update this task" });
    }

    const { data, error } = await supabase
        .from("tasks")
        .update({ title, description, status_id, assigned_to })
        .eq("id", id)
        .select();

    if (error) return handleError(res, error);
    res.json(data);
});

// 🟢 Delete a Task (With Authorization)
app.delete("/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    // 🔐 Ensure only assigned user or project owner can delete the task
    const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select("assigned_to, project_id")
        .eq("id", id)
        .single();

    if (taskError || !task) return res.status(404).json({ error: "Task not found" });

    const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("owner_id")
        .eq("id", task.project_id)
        .single();

    if (projectError || !project || (task.assigned_to !== user_id && project.owner_id !== user_id)) {
        return res.status(403).json({ error: "You are not authorized to delete this task" });
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return handleError(res, error);
    res.json({ message: "Task deleted successfully" });
});

// 📌 START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
