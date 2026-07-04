const express = require("express");
const router = express.Router();
const { auth, isVerifiedUser, isOperator } = require("../middlewares/auth");

const Tasks = require("../models/TasksModel");

router.delete("/bulk-delete", auth, isVerifiedUser, isOperator, async (req, res) => {
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

        const runningTasks = tasks.filter(
            (task) => task.status === "running"
        );

        if (runningTasks.length > 0) {
            return res.status(400).json({
                message:
                    "Running tasks cannot be bulk deleted. Complete them first.",
                blockedTaskIds: runningTasks.map((task) => task.task_id),
            });
        }

        const result = await Tasks.deleteMany({
            task_id: { $in: taskIds },
            status: { $ne: "running" },
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
