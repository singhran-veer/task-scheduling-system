const Tasks = require("../models/TasksModel");

async function generateTaskId() {
    const tasks = await Tasks.find(
        { task_id: /^TS\d+$/ },
        { task_id: 1, _id: 0 }
    ).lean();

    const maxNumber = tasks.reduce((max, task) => {
        const number = parseInt(task.task_id.replace("TS", ""), 10);
        return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    let nextNumber = maxNumber + 1;
    let nextTaskId = `TS${String(nextNumber).padStart(3, "0")}`;

    while (await Tasks.exists({ task_id: nextTaskId })) {
        nextNumber += 1;
        nextTaskId = `TS${String(nextNumber).padStart(3, "0")}`;
    }

    return nextTaskId;
}

module.exports = generateTaskId;
