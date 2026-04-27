const express = require("express");
const router = express.Router();
const Machines = require("../models/MachinesModel");
const { calculateTrackedMinutes, calculateEfficiency } = require("../utils/operatingTime");

router.get("/machine-utilization", async (req, res) => {
    try {
        const now = new Date();
        const machines = await Machines.find({}, {
            _id: 0,
            machine_id: 1,
            machine_name: 1,
            total_working_time: 1,
            total_idle_time: 1,
            total_maintenance_time: 1,
            status: 1,
            last_status_change: 1,
            max_operating_hours_per_day: 1,
        });

        const data = machines.map(m => {
            let totalWorkingTime = m.total_working_time || 0;
            let totalIdleTime = m.total_idle_time || 0;
            let totalMaintenanceTime = m.total_maintenance_time || 0;

            if (m.status === "busy") {
                totalWorkingTime += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            } else if (m.status === "idle") {
                totalIdleTime += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            } else if (m.status === "maintenance") {
                totalMaintenanceTime += calculateTrackedMinutes(
                    m.last_status_change,
                    now,
                    m.max_operating_hours_per_day
                );
            }

            const efficiency = calculateEfficiency(totalWorkingTime, totalIdleTime);

            return {
                machine_id: m.machine_id,
                machine_name: m.machine_name,
                total_working_time: totalWorkingTime,
                total_idle_time: totalIdleTime,
                total_maintenance_time: totalMaintenanceTime,
                efficiency: Number(efficiency.toFixed(2))
            };
        });

        res.json({ data });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
