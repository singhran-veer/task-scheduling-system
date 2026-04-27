const express = require("express");
const router = express.Router();

// Import Models
const Tasks = require("../models/TasksModel");
const ActivityFeeds = require("../models/ActivityFeedsModel");

// Import utility (create similar to routeIdGenerator)
const generateTaskId = require("../utils/taskIdGenerator");

// Add New Task endpoint
router.post("/", async (req, res) => {
    try {
        // Check request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Please provide data in the request body.",
            });
        }

        const data = req.body;

        if (typeof data !== "object") {
            return res.status(400).json({
                message: "Invalid data format. Please send a JSON object.",
            });
        }

        // Required fields for Task
        const requiredFields = [
            "task_name",
            "task_type",
            "required_machine_type",
            "priority",
            "duration"
        ];

        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        // Duplicate check (optional logic)
        const existingTask = await Tasks.findOne({
            task_name: data.task_name,
            status: { $ne: "completed" }
        });

        if (existingTask) {
            return res.status(409).json({
                message: `Task "${data.task_name}" already exists and is not completed.`,
            });
        }

        // Generate unique task ID
        const taskId = await generateTaskId();

        // Create new task
        const newTask = new Tasks({
            task_id: taskId,
            ...data,
            status: "pending",
        });

        const savedTask = await newTask.save();

        // Update activity feed
        try {
            const newActivityFeed = new ActivityFeeds({
                task_id: taskId,
                status: "created",
                action_time: new Date(),
            });
            await newActivityFeed.save();
        } catch (activityFeedError) {
            console.error("Activity feed update failed:", activityFeedError.message);
        }

        res.status(201).json({
            message: "Task added successfully",
            task: {
                task_id: savedTask.task_id,
                task_name: savedTask.task_name,
                task_type: savedTask.task_type,
                priority: savedTask.priority,
                duration: savedTask.duration,
                status: savedTask.status,
                created_at: savedTask.created_at,
            },
        });

    } catch (error) {

        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Duplicate task entry detected.",
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed.",
            });
        }

        res.status(500).json({
            message: "Internal server error.",
        });
    }
});

module.exports = router;
