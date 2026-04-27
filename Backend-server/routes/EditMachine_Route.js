const express = require("express");
const router = express.Router();
const Machines = require("../models/MachinesModel");
const { getTrackedMinutesByStatus, calculateEfficiency } = require("../utils/operatingTime");

router.put("/:machine_id", async (req, res) => {
    try {
        const existingMachine = await Machines.findOne({
            machine_id: req.params.machine_id,
        });

        if (!existingMachine) {
            return res.status(404).json({ message: "Machine not found" });
        }

        const updatePayload = {
            ...req.body,
            updated_at: new Date(),
        };

        if (
            req.body.status &&
            req.body.status !== existingMachine.status
        ) {
            const now = new Date();
            const tracked = getTrackedMinutesByStatus(
                existingMachine.status,
                existingMachine.last_status_change,
                now,
                existingMachine.max_operating_hours_per_day
            );

            updatePayload.total_working_time =
                (existingMachine.total_working_time || 0) + tracked.workingMinutes;
            updatePayload.total_idle_time =
                (existingMachine.total_idle_time || 0) + tracked.idleMinutes;
            updatePayload.total_maintenance_time =
                (existingMachine.total_maintenance_time || 0) +
                tracked.maintenanceMinutes;
            updatePayload.last_status_change = now;
            updatePayload.efficiency = calculateEfficiency(
                updatePayload.total_working_time,
                updatePayload.total_idle_time
            );

            if (req.body.status === "maintenance") {
                updatePayload.last_maintenance_date = now;
                updatePayload.breakdown_count =
                    (existingMachine.breakdown_count || 0) + 1;
            }
        }

        const updated = await Machines.findOneAndUpdate(
            { machine_id: req.params.machine_id },
            updatePayload,
            { new: true }
        );

        res.json({ message: "Machine updated", machine: updated });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
