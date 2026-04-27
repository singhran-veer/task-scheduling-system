const express = require("express");
const router = express.Router();

const Machines = require("../models/MachinesModel");
const Tasks = require("../models/TasksModel");

router.post("/reset", async (req, res) => {
    try {
        await Tasks.updateMany({}, {
            status: "pending",
            assignedMachine_id: null,
            assigned_at: null,
            completed_at: null
        });

        await Machines.updateMany({}, {
            status: "idle",
            assignedTask_id: null,
            total_working_time: 0,
            total_idle_time: 0,
            total_maintenance_time: 0,
            efficiency: 0
        });

        res.json({ message: "Scheduler reset successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
