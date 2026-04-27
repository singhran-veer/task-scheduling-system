const express = require("express");
const router = express.Router();

const Tasks = require("../models/TasksModel");

router.delete("/bulk-delete", async (req, res) => {
    try {
        const { taskIds } = req.body;

        if (!Array.isArray(taskIds) || taskIds.length === 0) {
            return res.status(400).json({
                message: "Please provide taskIds as a non-empty array.",
            });
        }

        const tasks = await Tasks.find(
            { task_id: { $in: taskIds } },
            { task_id: 1, status: 1 }
        ).lean();

        const runningOrCompletedTasks = tasks.filter(
            (task) => task.status === "running" || task.status === "completed"
        );

        if (runningOrCompletedTasks.length > 0) {
            return res.status(400).json({
                message:
                    "Running or completed tasks cannot be bulk deleted.",
                blockedTaskIds: runningOrCompletedTasks.map((task) => task.task_id),
            });
        }

        const result = await Tasks.deleteMany({
            task_id: { $in: taskIds },
            status: { $nin: ["running", "completed"] },
        });

        return res.status(200).json({
            message: "Selected tasks deleted successfully.",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
