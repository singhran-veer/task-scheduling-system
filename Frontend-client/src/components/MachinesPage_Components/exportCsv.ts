import type { MachineRow } from "../../common/Types/Interfaces";

export const exportMachinesCsv = (machines: MachineRow[]) => {
    if (!machines || machines.length === 0) {
        console.warn("No machines to export.");
        return;
    }

    const headers = [
        "Machine ID",
        "Machine Name",
        "Machine Type",
        "Status",
        "Capabilities",
        "Assigned Task",
        "Total Working Time (min)",
        "Total Idle Time (min)",
        "Efficiency (%)",
        "Created At",
    ];

    const rows = machines.map((m) => [
        m.machine_id,
        m.machine_name,
        m.machine_type,
        m.status,
        m.capabilities?.join(" | ") || "",
        m.assignedTask?.id || "Unassigned",
        m.total_working_time ?? 0,
        m.total_idle_time ?? 0,
        m.efficiency ?? 0,
        m.created_at ? new Date(m.created_at).toLocaleDateString() : "",
    ]);

    const csvContent =
        [headers, ...rows]
            .map((row) =>
                row
                    .map((field) =>
                        `"${String(field).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "machines.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
