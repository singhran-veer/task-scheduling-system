const express = require("express");
const router = express.Router();

const Machines = require("../models/MachinesModel");
const Tasks = require("../models/TasksModel");
const ActivityFeeds = require("../models/ActivityFeedsModel");
const {
    calculateTrackedMinutes,
    calculateEfficiency,
} = require("../utils/operatingTime");

const completeTaskHandler = async (req, res) => {
    try {
        const { taskId } = req.params;
        const now = new Date();

        // ==========================
        // FIND TASK
        // ==========================
        const task = await Tasks.findOne({ task_id: taskId });

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        if (task.status !== "running") {
            return res.status(400).json({
                message: "Task is not currently in progress",
            });
        }

        // ==========================
        // FIND MACHINE
        // ==========================
        const machine = await Machines.findOne({
            machine_id: task.assignedMachine_id,
        });

        if (!machine) {
            return res.status(404).json({
                message: "Assigned machine not found",
            });
        }

        // ==========================
        // CALCULATE WORKING TIME (MINUTES)
        // ==========================
        const workingDurationMinutes = calculateTrackedMinutes(
            machine.last_status_change,
            now,
            machine.max_operating_hours_per_day
        );

        machine.total_working_time += workingDurationMinutes;

        // ==========================
        // PUSH TO MACHINE HISTORY
        // ==========================
        machine.pastAssignedTasks.push({
            task_id: task.task_id,
            assigned_at: task.assigned_at,
            completed_at: now,
            duration: workingDurationMinutes,
        });

        // ==========================
        // UPDATE MACHINE STATUS
        // ==========================
        machine.status = "idle";
        machine.assignedTask_id = null;
        machine.last_status_change = now;

        // ==========================
        // CALCULATE MACHINE EFFICIENCY
        // ==========================
        machine.efficiency = calculateEfficiency(
            machine.total_working_time,
            machine.total_idle_time
        );

        await machine.save();

        // ==========================
        // COMPLETE TASK
        // ==========================
        const completedMachineId = machine.machine_id;

        task.status = "completed";
        task.completed_at = now;
        task.lastMachine_id = completedMachineId;
        task.assignedMachine_id = null;

        await task.save();

        // ==========================
        // ACTIVITY LOGGING
        // ==========================
        await ActivityFeeds.create({
            entity_type: "task",
            entity_id: task.task_id,
            action: "task_completed",
            related_machine_id: completedMachineId,
            details: {
                completed_at: now,
                duration_minutes: workingDurationMinutes,
            },
        });

        await ActivityFeeds.create({
            entity_type: "machine",
            entity_id: machine.machine_id,
            action: "machine_idle",
            related_task_id: task.task_id,
            details: {
                total_working_time: machine.total_working_time,
                efficiency: machine.efficiency,
            },
        });

        res.status(200).json({
            message: "Task completed successfully",
            working_time_added_minutes: workingDurationMinutes,
            machine_efficiency: machine.efficiency.toFixed(2) + "%",
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to complete task",
            error: error.message,
        });
    }
};

router.patch("/:taskId/complete", completeTaskHandler);
router.post("/:taskId/complete", completeTaskHandler);

module.exports = router;
