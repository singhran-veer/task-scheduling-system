const express = require("express");
const router = express.Router();

const Machines = require("../models/MachinesModel");
const Tasks = require("../models/TasksModel");
const ActivityFeeds = require("../models/ActivityFeedsModel");
const { calculateTrackedMinutes } = require("../utils/operatingTime");

router.post("/run", async (req, res) => {
    try {
        const now = new Date();

        // Get all pending tasks sorted by highest priority first
        const pendingTasks = await Tasks.find({
            status: "pending",
        }).sort({ priority: -1, deadline: 1, duration: 1, arrival_time: 1 });

        let assignedCount = 0;

        for (let task of pendingTasks) {
            // Find an idle machine matching type + capability
            const machine = await Machines.findOne({
                status: "idle",
                machine_type: task.required_machine_type,
                capabilities: { $all: task.required_capabilities },
            }).sort({ total_working_time: 1 });

            if (!machine) continue;

            // ===============================
            // CALCULATE IDLE TIME (in minutes)
            // ===============================
            const idleDurationMinutes = calculateTrackedMinutes(
                machine.last_status_change,
                now,
                machine.max_operating_hours_per_day
            );

            machine.total_idle_time += idleDurationMinutes;

            // ===============================
            // UPDATE MACHINE
            // ===============================
            machine.status = "busy";
            machine.last_status_change = now;
            machine.assignedTask_id = task.task_id;

            await machine.save();

            // ===============================
            // UPDATE TASK
            // ===============================
            task.status = "running"; 
            task.assignedMachine_id = machine.machine_id;
            task.assigned_at = now;

            await task.save();

            // ===============================
            // ACTIVITY LOGGING
            // ===============================
            await ActivityFeeds.create({
                entity_type: "task",
                entity_id: task.task_id,
                action: "task_assigned",
                related_machine_id: machine.machine_id,
                related_task_id: task.task_id,
                details: {
                    machine_name: machine.machine_name,
                    priority: task.priority,
                    assigned_at: now,
                },
            });

            await ActivityFeeds.create({
                entity_type: "machine",
                entity_id: machine.machine_id,
                action: "machine_busy",
                related_task_id: task.task_id,
                details: {
                    task_name: task.task_name,
                },
            });

            assignedCount++;
        }

        // ===============================
        // LOG SCHEDULER EXECUTION
        // ===============================
        await ActivityFeeds.create({
            entity_type: "system",
            entity_id: "scheduler",
            action: "scheduler_run",
            details: {
                tasks_checked: pendingTasks.length,
                tasks_assigned: assignedCount,
                execution_time: now,
            },
        });

        res.status(200).json({
            message: "Scheduler executed successfully",
            tasks_assigned: assignedCount,
        });
    } catch (error) {
        res.status(500).json({
            message: "Scheduler failed",
            error: error.message,
        });
    }
});

module.exports = router;
