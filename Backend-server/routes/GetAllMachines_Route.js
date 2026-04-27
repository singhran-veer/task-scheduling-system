const express = require("express");
const router = express.Router();

// Import Model
const Machines = require("../models/MachinesModel");
const {
    calculateEfficiency,
    getTrackedMinutesByStatus,
} = require("../utils/operatingTime");

// GET All Machines
// /api/machines?page=1&limit=15&machineIdOrName=MC001&status=idle&machineType=CNC

router.get("/", async (req, res) => {
    try {
        const now = new Date();
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        // Filters
        const { machineIdOrName, status, machineType } = req.query;

        const filter = {};

        // Search by machine_id OR machine_name
        if (machineIdOrName && machineIdOrName.trim() !== "") {
            filter.$or = [
                { machine_id: { $regex: machineIdOrName, $options: "i" } },
                { machine_name: { $regex: machineIdOrName, $options: "i" } },
            ];
        }

        // Filter by status
        if (status && status.trim() !== "") {
            filter.status = { $regex: status, $options: "i" };
        }

        // Filter by machine type
        if (machineType && machineType.trim() !== "") {
            filter.machine_type = { $regex: machineType, $options: "i" };
        }

        // Fetch machines
        const machines = await Machines.find(
            filter,
            {
                _id: 0,
                machine_id: 1,
                machine_name: 1,
                machine_type: 1,
                status: 1,
                capabilities: 1,
                assignedTask_id: 1,
                total_working_time: 1,
                total_idle_time: 1,
                total_maintenance_time: 1,
                efficiency: 1,
                created_at: 1,
                last_status_change: 1,
                max_operating_hours_per_day: 1,
            },
            { skip, limit, sort: { created_at: -1 } }
        ).lean();

        // Format response
        const data = machines.map((m) => {
            const tracked = getTrackedMinutesByStatus(
                m.status,
                m.last_status_change,
                now,
                m.max_operating_hours_per_day
            );
            const totalWorkingTime =
                (m.total_working_time || 0) + tracked.workingMinutes;
            const totalIdleTime =
                (m.total_idle_time || 0) + tracked.idleMinutes;
            const totalMaintenanceTime =
                (m.total_maintenance_time || 0) + tracked.maintenanceMinutes;

            return {
                machine_id: m.machine_id,
                machine_name: m.machine_name,
                machine_type: m.machine_type,
                status: m.status,
                capabilities: m.capabilities || [],
                assignedTask: m.assignedTask_id
                    ? { id: m.assignedTask_id }
                    : null,
                total_working_time: totalWorkingTime,
                total_idle_time: totalIdleTime,
                total_maintenance_time: totalMaintenanceTime,
                efficiency: calculateEfficiency(
                    totalWorkingTime,
                    totalIdleTime
                ),
                created_at: m.created_at || null,
            };
        });

        const totalDocs = await Machines.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / limit) || 1;

        return res.status(200).json({
            data,
            currentPage: page,
            totalPages,
            totalDocs,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
