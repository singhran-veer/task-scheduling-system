const express = require("express");
const router = express.Router();

const Machines = require("../models/MachinesModel");
const Tasks = require("../models/TasksModel");
const {
    calculateTrackedMinutes,
    calculateEfficiency,
} = require("../utils/operatingTime");

router.get("/", async (req, res) => {
    try {
        const now = new Date();

        // =========================
        // MACHINE COUNTS
        // =========================

        const totalMachines = await Machines.countDocuments();
        const idleMachines = await Machines.countDocuments({ status: "idle" });
        const busyMachines = await Machines.countDocuments({ status: "busy" });
        const maintenanceMachines = await Machines.countDocuments({
            status: "maintenance",
        });

        let utilizationPercentage = 0;
        if (totalMachines > 0) {
            utilizationPercentage =
                (busyMachines / totalMachines) * 100;
        }

        // =========================
        // TASK COUNTS
        // =========================

        const totalTasks = await Tasks.countDocuments();
        const pendingTasks = await Tasks.countDocuments({ status: "pending" });
        const runningTasks = await Tasks.countDocuments({ status: "running" });
        const completedTasks = await Tasks.countDocuments({
            status: "completed",
        });

        const overdueTasks = await Tasks.countDocuments({
            status: { $ne: "completed" },
            due_date: { $lt: now },
        });

        // =========================
        // TIME CALCULATION
        // =========================

        const machines = await Machines.find({}).lean();

        let totalWorkingTime = 0;
        let totalIdleTime = 0;
        let totalMaintenanceTime = 0;

        machines.forEach((machine) => {
            totalWorkingTime += machine.total_working_time || 0;
            totalIdleTime += machine.total_idle_time || 0;
            totalMaintenanceTime += machine.total_maintenance_time || 0;

            if (machine.status === "busy") {
                totalWorkingTime +=
                    calculateTrackedMinutes(
                        machine.last_status_change,
                        now,
                        machine.max_operating_hours_per_day
                    );
            } else if (machine.status === "idle") {
                totalIdleTime +=
                    calculateTrackedMinutes(
                        machine.last_status_change,
                        now,
                        machine.max_operating_hours_per_day
                    );
            } else if (machine.status === "maintenance") {
                totalMaintenanceTime +=
                    calculateTrackedMinutes(
                        machine.last_status_change,
                        now,
                        machine.max_operating_hours_per_day
                    );
            }
        });

        const systemEfficiency = calculateEfficiency(
            totalWorkingTime,
            totalIdleTime
        );

        res.status(200).json({
            machines: {
                total: totalMachines,
                idle: idleMachines,
                busy: busyMachines,
                maintenance: maintenanceMachines,
                utilization_percentage:
                    utilizationPercentage.toFixed(2),
            },
            tasks: {
                total: totalTasks,
                pending: pendingTasks,
                running: runningTasks,
                completed: completedTasks,
                overdue: overdueTasks,
            },
            system: {
                total_working_time: Math.floor(totalWorkingTime),
                total_idle_time: Math.floor(totalIdleTime),
                total_maintenance_time: Math.floor(totalMaintenanceTime),
                efficiency_percentage:
                    systemEfficiency.toFixed(2),
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
});

module.exports = router;
