import { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";
import type { TableColumn, TaskRow } from "../../common/Types/Interfaces";

interface TasksTableProps {
    tasks: TaskRow[];
    selected: Record<string, boolean>;
    selectedCount: number;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleOne: (id: string) => void;
    onViewTask: (task: TaskRow) => void;
    onEditTask: (id: string) => void;
    onDeleteTask: (id: string) => void;
    onCompleteTask: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}

const TasksTable = ({
    tasks,
    selected,
    selectedCount,
    allSelected,
    onToggleAll,
    onToggleOne,
    onViewTask,
    onEditTask,
    onDeleteTask,
    onCompleteTask,
    isLoading,
    error,
}: TasksTableProps) => {

    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate =
                selectedCount > 0 && !allSelected;
        }
    }, [selectedCount, allSelected]);

    const columns: TableColumn<TaskRow>[] = [
        {
            key: "select",
            label: (
                <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                />
            ),
            render: (row: TaskRow) => (
                <input
                    type="checkbox"
                    checked={!!selected[row.task_id]}
                    onChange={() => onToggleOne(row.task_id)}
                />
            ),
            align: "center",
        },
        { key: "task_id", label: "Task ID", align: "left" },
        { key: "task_name", label: "Task Name", align: "left" },
        { key: "task_type", label: "Type", align: "center" },
        {
            key: "required_machine_type",
            label: "Required Machine",
            align: "center",
        },
        {
            key: "required_capabilities",
            label: "Required Capabilities",
            render: (row: TaskRow) =>
                row.required_capabilities?.length
                    ? row.required_capabilities.join(", ")
                    : "None",
            align: "center",
        },
        {
            key: "priority",
            label: "Priority",
            align: "center",
        },
        {
            key: "duration",
            label: "Duration",
            render: (row: TaskRow) =>
                `${row.duration} ${row.time_unit || "minutes"}`,
            align: "center",
        },
        {
            key: "deadline",
            label: "Deadline",
            render: (row: TaskRow) =>
                row.deadline
                    ? new Date(row.deadline).toLocaleString()
                    : "N/A",
            align: "center",
        },
        {
            key: "assignedMachine_id",
            label: "Assigned Machine",
            render: (row: TaskRow) =>
                row.assignedMachine_id ? (
                    <NavLink
                        to={`/machines/${row.assignedMachine_id}`}
                        className="blue-c"
                    >
                        {row.assignedMachine?.name || row.assignedMachine_id}
                    </NavLink>
                ) : (
                    <span className="gray-c">Unassigned</span>
                ),
            align: "center",
        },
        {
            key: "status",
            label: "Status",
            render: (row: TaskRow) => {
                const cls =
                    row.status === "completed"
                        ? "status-assigned"
                        : row.status === "running"
                        ? "status-inProgress"
                        : row.status === "scheduled"
                        ? "status-unassigned"
                        : "status-unassigned";

                return (
                    <span className={`status-badge ${cls}`}>
                        {row.status}
                    </span>
                );
            },
            align: "center",
        },
        {
            key: "actions",
            label: "Actions",
            render: (row: TaskRow) => (
                <div className="task-actions">
                    <button
                        type="button"
                        className="task-action-btn view"
                        title={`View ${row.task_id}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onViewTask(row);
                        }}
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>
                    <button
                        type="button"
                        className="task-action-btn edit"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEditTask(row.task_id);
                        }}
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                        type="button"
                        className="task-action-btn delete"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDeleteTask(row.task_id);
                        }}
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                    {row.status === "running" && (
                        <button
                            type="button"
                            className="task-action-btn complete"
                            onClick={() => onCompleteTask(row.task_id)}
                            title="Mark Completed"
                        >
                            <i className="fa-solid fa-circle-check"></i>
                        </button>
                    )}
                </div>
            ),
            align: "center",
        },
    ];

    return (
        <ResponsiveTable<TaskRow>
            columns={columns}
            rows={tasks}
            stickyHeader
            tableClassName="w-full"
            isLoading={isLoading}
            error={error}
        />
    );
};

export default TasksTable;
