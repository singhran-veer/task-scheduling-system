const Tasks = require("../models/TasksModel");

async function generateTaskId() {
    const lastTask = await Tasks.findOne({})
        .sort({ created_at: -1 })
        .lean();

    if (!lastTask || !lastTask.task_id) {
        return "TS001";
    }

    const lastNumber = parseInt(
        lastTask.task_id.replace("TS", "")
    );

    const newNumber = lastNumber + 1;

    return `TS${String(newNumber).padStart(3, "0")}`;
}

module.exports = generateTaskId;
