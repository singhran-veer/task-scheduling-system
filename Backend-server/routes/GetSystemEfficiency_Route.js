const express = require("express");
const router = express.Router();
const Machines = require("../models/MachinesModel");
const { calculateTrackedMinutes, calculateEfficiency } = require("../utils/operatingTime");

router.get("/system-efficiency", async (req, res) => {
    try {
        const now = new Date();
        const machines = await Machines.find({});

        let totalWorking = 0;
        let totalIdle = 0;
        let totalMaintenance = 0;

        machines.forEach(m => {
            totalWorking += m.total_working_time || 0;
            totalIdle += m.total_idle_time || 0;
            totalMaintenance += m.total_maintenance_time || 0;

            if (m.status === "busy") {
                totalWorking += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            } else if (m.status === "idle") {
                totalIdle += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            } else if (m.status === "maintenance") {
                totalMaintenance += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            }
        });

        const efficiency = calculateEfficiency(totalWorking, totalIdle);

        res.json({
            totalWorking,
            totalIdle,
            totalMaintenance,
            efficiency: Number(efficiency.toFixed(2))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
