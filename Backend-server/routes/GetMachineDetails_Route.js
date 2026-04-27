const express = require("express");
const router = express.Router();
const Machines = require("../models/MachinesModel");
const {
    calculateEfficiency,
    getTrackedMinutesByStatus,
} = require("../utils/operatingTime");

// GET Machine Details
// /api/machines/:machineId

router.get("/:machineId", async (req, res) => {
    try {
        const { machineId } = req.params;

        const machine = await Machines.findOne(
            { machine_id: machineId },
            { _id: 0, __v: 0 }
        ).lean();

        if (!machine) {
            return res
                .status(404)
                .json({ message: "Machine not found" });
        }

        const now = new Date();
        const tracked = getTrackedMinutesByStatus(
            machine.status,
            machine.last_status_change,
            now,
            machine.max_operating_hours_per_day
        );
        const totalWorkingTime =
            (machine.total_working_time || 0) + tracked.workingMinutes;
        const totalIdleTime =
            (machine.total_idle_time || 0) + tracked.idleMinutes;
        const totalMaintenanceTime =
            (machine.total_maintenance_time || 0) + tracked.maintenanceMinutes;

        return res.status(200).json({
            ...machine,
            total_working_time: totalWorkingTime,
            total_idle_time: totalIdleTime,
            total_maintenance_time: totalMaintenanceTime,
            efficiency: calculateEfficiency(totalWorkingTime, totalIdleTime),
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: error.message });
    }
});

module.exports = router;
