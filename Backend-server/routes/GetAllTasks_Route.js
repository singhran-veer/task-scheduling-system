const express = require("express");
const router = express.Router();

// Import Models
const Tasks = require("../models/TasksModel");
const Machines = require("../models/MachinesModel");

/*
GET All Tasks
/api/tasks?page=1&limit=15&taskIdOrName=TS001&status=pending&priority=5&machineType=CNC
*/
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const {
            taskIdOrName,
            status,
            priority,
            machineType,
            requiredMachineType,
        } = req.query;

        const filter = {};

        // Search by task_id or task_name
        if (taskIdOrName && taskIdOrName.trim() !== "") {
            filter.$or = [
                { task_id: { $regex: taskIdOrName, $options: "i" } },
                { task_name: { $regex: taskIdOrName, $options: "i" } },
            ];
        }

        // Filter by status
        if (status && status.trim() !== "") {
            filter.status = { $regex: status, $options: "i" };
        }

        // Filter by priority
        if (priority && !isNaN(priority)) {
            filter.priority = parseInt(priority);
        }

        // Filter by required machine type
        const machineTypeFilter = requiredMachineType || machineType;

        if (machineTypeFilter && machineTypeFilter.trim() !== "") {
            filter.required_machine_type = {
                $regex: machineTypeFilter,
                $options: "i",
            };
        }

        const tasks = await Tasks.find(
            filter,
            {
                _id: 0,
                task_id: 1,
                task_name: 1,
                task_type: 1,
                required_machine_type: 1,
                required_capabilities: 1,
                priority: 1,
                duration: 1,
                time_unit: 1,
                deadline: 1,
                status: 1,
                assignedMachine_id: 1,
                lastMachine_id: 1,
                assigned_at: 1,
                completed_at: 1,
                cost: 1,
                currency: 1,
                notes: 1,
                arrival_time: 1,
                created_at: 1,
                updated_at: 1,
            },
            { skip, limit, sort: { created_at: -1 } }
        ).lean();

        // Get machine names for assigned machines
        const machineIds = tasks
            .filter((t) => t.assignedMachine_id)
            .map((t) => t.assignedMachine_id);

        const uniqueMachineIds = [...new Set(machineIds)];

        let machineNameMap = {};

        if (uniqueMachineIds.length > 0) {
            const machines = await Machines.find(
                { machine_id: { $in: uniqueMachineIds } },
                { _id: 0, machine_id: 1, machine_name: 1 }
            ).lean();

            machineNameMap = machines.reduce((acc, m) => {
                acc[m.machine_id] = m.machine_name;
                return acc;
            }, {});
        }

        const formatted = tasks.map((t) => ({
            task_id: t.task_id,
            task_name: t.task_name,
            task_type: t.task_type,
            required_machine_type: t.required_machine_type,
            required_capabilities: t.required_capabilities || [],
            priority: t.priority,
            duration: t.duration,
            time_unit: t.time_unit || "minutes",
            deadline: t.deadline || null,
            status: t.status,
            assignedMachine_id: t.assignedMachine_id || null,
            assignedMachine: t.assignedMachine_id
                ? {
                      id: t.assignedMachine_id,
                      name: machineNameMap[t.assignedMachine_id] || null,
                  }
                : null,
            lastMachine_id: t.lastMachine_id || null,
            ...(t.assignedMachine_id
                ? { assigned_at: t.assigned_at || null }
                : {}),
            completed_at: t.completed_at || null,
            cost: t.cost ?? null,
            currency: t.currency || "INR",
            notes: t.notes || "",
            arrival_time: t.arrival_time || null,
            created_at: t.created_at || null,
            updated_at: t.updated_at || null,
        }));

        const totalDocs = await Tasks.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / limit) || 1;

        res.status(200).json({
            data: formatted,
            currentPage: page,
            totalPages,
            totalDocs,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


/*
GET Tasks Summary
/api/tasks/summary
(Useful for dashboard)
*/
router.get("/summary", async (req, res) => {
    try {
        const tasks = await Tasks.find(
            {},
            {
                _id: 0,
                task_id: 1,
                task_name: 1,
                status: 1,
                priority: 1,
                assignedMachine_id: 1,
                updated_at: 1,
            },
            { sort: { updated_at: -1 }, limit: 20 }
        ).lean();

        const machineIds = tasks
            .filter((t) => t.assignedMachine_id)
            .map((t) => t.assignedMachine_id);

        const uniqueMachineIds = [...new Set(machineIds)];

        let machineNameMap = {};

        if (uniqueMachineIds.length > 0) {
            const machines = await Machines.find(
                { machine_id: { $in: uniqueMachineIds } },
                { _id: 0, machine_id: 1, machine_name: 1 }
            ).lean();

            machineNameMap = machines.reduce((acc, m) => {
                acc[m.machine_id] = m.machine_name;
                return acc;
            }, {});
        }

        const data = tasks.map((t) => ({
            task_id: t.task_id,
            task_name: t.task_name,
            status: t.status,
            priority: t.priority,
            assignedMachine: t.assignedMachine_id
                ? {
                      id: t.assignedMachine_id,
                      name: machineNameMap[t.assignedMachine_id] || null,
                  }
                : null,
            updated_at: t.updated_at || null,
        }));

        res.status(200).json({ data });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
