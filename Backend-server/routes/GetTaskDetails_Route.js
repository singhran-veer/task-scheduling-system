const express = require("express");
const router = express.Router();

const Tasks = require("../models/TasksModel");
const Machines = require("../models/MachinesModel");

router.get("/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;

        const task = await Tasks.findOne(
            { task_id: taskId },
            { _id: 0, __v: 0 }
        ).lean();

        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }

        let assignedMachine = null;
        let previousMachine = null;

        if (task.assignedMachine_id) {
            const machine = await Machines.findOne(
                { machine_id: task.assignedMachine_id },
                { _id: 0, machine_id: 1, machine_name: 1, machine_type: 1, status: 1 }
            ).lean();

            if (machine) {
                assignedMachine = {
                    id: machine.machine_id,
                    name: machine.machine_name,
                    type: machine.machine_type,
                    status: machine.status,
                };
            }
        }

        if (task.lastMachine_id) {
            const machine = await Machines.findOne(
                { machine_id: task.lastMachine_id },
                { _id: 0, machine_id: 1, machine_name: 1, machine_type: 1, status: 1 }
            ).lean();

            if (machine) {
                previousMachine = {
                    id: machine.machine_id,
                    name: machine.machine_name,
                    type: machine.machine_type,
                    status: machine.status,
                };
            }
        }

        return res.status(200).json({
            ...task,
            assignedMachine,
            previousMachine,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
});

module.exports = router;
