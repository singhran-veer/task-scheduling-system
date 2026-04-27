const express = require("express");
const router = express.Router();
const Tasks = require("../models/TasksModel");

router.delete("/:task_id", async (req, res) => {
    try {
        const task = await Tasks.findOne({ task_id: req.params.task_id });

        if (!task)
            return res.status(404).json({ message: "Task not found" });

        if (task.status === "completed")
            return res.status(400).json({ message: "Cannot delete completed task" });

        await Tasks.deleteOne({ task_id: req.params.task_id });

        res.json({ message: "Task deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
