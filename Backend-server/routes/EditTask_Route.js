const express = require("express");
const router = express.Router();

const Tasks = require("../models/TasksModel");

// ===============================
// EDIT TASK
// PUT /api/tasks/:task_id
// ===============================
router.put("/:task_id", async (req, res) => {
    try {
        const { task_id } = req.params;

        const task = await Tasks.findOne({ task_id });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        // Prevent editing completed tasks (optional safety)
        if (task.status === "completed") {
            return res.status(400).json({
                message: "Cannot edit a completed task",
            });
        }

        // Update fields dynamically
        Object.keys(req.body).forEach((key) => {
            task[key] = req.body[key];
        });

        task.updated_at = new Date();

        await task.save();

        res.status(200).json({
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

module.exports = router;
