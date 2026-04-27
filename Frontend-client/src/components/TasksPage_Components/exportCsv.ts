import type { TaskRow } from "../../common/Types/Interfaces";

export const exportTasksCsv = (tasks: TaskRow[]) => {
    if (!tasks.length) return;

    const headers = [
        "Task ID",
        "Task Name",
        "Task Type",
        "Required Machine Type",
        "Required Capabilities",
        "Priority",
        "Duration",
        "Deadline",
        "Status",
        "Assigned Machine",
    ];

    const rows = tasks.map((task) => [
        task.task_id,
        task.task_name,
        task.task_type,
        task.required_machine_type,
        task.required_capabilities.join(" | "),
        task.priority,
        `${task.duration} ${task.time_unit}`,
        task.deadline ? new Date(task.deadline).toLocaleString() : "",
        task.status,
        task.assignedMachine?.name || task.assignedMachine_id || "Unassigned",
    ]);

    const csvContent = [headers, ...rows]
        .map((row) =>
            row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
