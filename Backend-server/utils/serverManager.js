const connectDB = require("./dbConnect");
const Tasks = require("../models/TasksModel");
const Machines = require("../models/MachinesModel");
const ActivityFeeds = require("../models/ActivityFeedsModel");
const {
    calculateTrackedMinutes,
    calculateEfficiency,
} = require("./operatingTime");

let retries = 0;
const MAX_RETRIES = 5;

/**
 * ============================================
 * AUTO COMPLETION WORKER
 * Checks every 60 seconds for completed tasks
 * ============================================
 */
const startAutoCompletionWorker = () => {
    setInterval(async () => {
        try {
            const now = new Date();

            // Fetch running tasks safely
            const runningTasks = await Tasks.find({
                status: "running",
                assigned_at: { $ne: null },
            }).lean();

            for (let task of runningTasks) {

                const finishTime = new Date(task.assigned_at);
                finishTime.setMinutes(
                    finishTime.getMinutes() + task.duration
                );

                // If task duration has passed
                if (now >= finishTime) {

                    // Atomic update protection (avoid double completion)
                    const updatedTask = await Tasks.findOneAndUpdate(
                        { task_id: task.task_id, status: "running" },
                        {
                            status: "completed",
                            completed_at: finishTime,
                            lastMachine_id: task.assignedMachine_id,
                            assignedMachine_id: null,
                        },
                        { new: true }
                    );

                    if (!updatedTask) continue; // Already processed

                    const machine = await Machines.findOne({
                        machine_id: task.assignedMachine_id,
                    });

                    if (!machine) continue;

                    // ==========================
                    // Accurate Working Time
                    // ==========================
                    const workingMinutes = calculateTrackedMinutes(
                        machine.last_status_change,
                        finishTime,
                        machine.max_operating_hours_per_day
                    );

                    machine.total_working_time += workingMinutes;
                    machine.pastAssignedTasks.push({
                        task_id: task.task_id,
                        assigned_at: task.assigned_at,
                        completed_at: finishTime,
                        duration: workingMinutes,
                    });
                    machine.status = "idle";
                    machine.assignedTask_id = null;
                    machine.last_status_change = finishTime;

                    machine.efficiency = calculateEfficiency(
                        machine.total_working_time,
                        machine.total_idle_time
                    );

                    await machine.save();

                    // ==========================
                    // Activity Logging
                    // ==========================
                    await ActivityFeeds.create({
                        entity_type: "task",
                        entity_id: task.task_id,
                        action: "task_completed",
                        related_machine_id: machine.machine_id,
                        related_task_id: task.task_id,
                        details: {
                            machine_name: machine.machine_name,
                            completed_at: finishTime,
                            duration_minutes: task.duration,
                        },
                    });

                    await ActivityFeeds.create({
                        entity_type: "machine",
                        entity_id: machine.machine_id,
                        action: "machine_idle",
                        related_task_id: task.task_id,
                        details: {
                            task_name: task.task_name,
                            idle_since: finishTime,
                            efficiency: machine.efficiency,
                        },
                    });

                    console.log(`✅ Auto-completed task ${task.task_id}`);
                }
            }

        } catch (err) {
            console.error("Auto-completion worker error:", err.message);
        }
    }, 60000); // Runs every 60 seconds
};


/**
 * ============================================
 * START SERVER WITH DB CONNECTION + RETRIES
 * ============================================
 */
const startServerWithDB = async (app, PORT) => {
    try {
        const isConnected = await connectDB();

        if (!isConnected) {
            throw new Error("Database connection failed");
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Start worker only after DB connects
        startAutoCompletionWorker();

    } catch (err) {
        retries++;

        if (retries <= MAX_RETRIES) {
            console.log(
                `Retrying DB connection... Attempt ${retries}/${MAX_RETRIES}`
            );
            setTimeout(() => startServerWithDB(app, PORT), 5000);
        } else {
            console.error("Max retries reached. Exiting...");
            process.exit(1);
        }
    }
};

module.exports = startServerWithDB;
