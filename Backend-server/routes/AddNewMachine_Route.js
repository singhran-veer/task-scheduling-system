const express = require("express");
const router = express.Router();

// Import Models
const Machines = require("../models/MachinesModel");
const ActivityFeeds = require("../models/ActivityFeedsModel");

// Import utilities (create this similar to driverIdGenerator)
const generateMachineId = require("../utils/machineIdGenerator");

// Add New Machine endpoint
router.post("/", async (req, res) => {
    try {
        // Check request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Please provide data in the request body.",
            });
        }

        const data = req.body;

        if (typeof data !== "object") {
            return res.status(400).json({
                message: "Invalid data format. Please send a JSON object.",
            });
        }

        // Required fields for Machine
        const requiredFields = [
            "machine_name",
            "machine_type"
        ];

        const missingFields = requiredFields.filter((field) => !data[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
            });
        }

        // Check duplicate machine name (optional but recommended)
        const existingMachine = await Machines.findOne({
            machine_name: data.machine_name,
        });

        if (existingMachine) {
            return res.status(409).json({
                message: "Machine already exists",
                error: "DUPLICATE_MACHINE",
                details: {
                    existing_machine_id: existingMachine.machine_id,
                    duplicate_field: "machine_name",
                    suggestion:
                        "A machine with this name already exists.",
                },
            });
        }

        // Generate custom machine ID
        const machineId = await generateMachineId();

        // Create new machine
        const newMachine = new Machines({
            machine_id: machineId,
            ...data,
        });

        const savedMachine = await newMachine.save();

        // Add Activity Feed entry
        try {
            const newActivityFeed = new ActivityFeeds({
                machine_id: savedMachine.machine_id,
                status: "created",
                action_time: new Date(),
            });
            await newActivityFeed.save();
        } catch (activityFeedError) {
            // Continue even if activity feed fails
        }

        res.status(201).json({
            message: "Machine added successfully",
            machine: savedMachine,
        });

    } catch (error) {

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Machine ID already exists. Please try again.",
                error: "DUPLICATE_MACHINE_ID",
                details: {
                    duplicate_field: "machine_id",
                    suggestion:
                        "This is rare. Please try again or contact support.",
                },
            });
        }

        // Handle validation errors
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message,
                value: err.value,
            }));

            return res.status(400).json({
                message: "Validation failed",
                error: "VALIDATION_ERROR",
                details: validationErrors,
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

module.exports = router;
