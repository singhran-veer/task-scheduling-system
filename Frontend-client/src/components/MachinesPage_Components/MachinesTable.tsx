import { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import ResponsiveTable from "../ResponsiveTable/ResponsiveTable";

interface MachineRow extends Record<string, unknown> {
    machine_id: string;
    machine_name: string;
    machine_type: string;
    status: string;
    capabilities: string[];
    assignedTask?: { id: string } | null;
    total_working_time: number;
    total_idle_time: number;
    efficiency: number;
}


interface MachinesTableProps {
    machines: MachineRow[];
    selected: Record<string, boolean>;
    selectedCount: number;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleOne: (id: string) => void;
    onViewMachine: (id: string) => void;
    onEditMachine: (id: string) => void;
    onDeleteMachine: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}

interface TableColumn<T> {
    key: string;
    label: any;
    render?: (row: T) => React.ReactNode;
    align?: "left" | "center" | "right";
}

const MachinesTable = ({
    machines,
    selected,
    selectedCount,
    allSelected,
    onToggleAll,
    onToggleOne,
    onViewMachine,
    onEditMachine,
    onDeleteMachine,
    isLoading,
    error,
}: MachinesTableProps) => {

    const headerCheckboxRef =
        useRef<HTMLInputElement>(null);

    useEffect(() => {

        if (headerCheckboxRef.current) {

            headerCheckboxRef.current.indeterminate =
                selectedCount > 0 && !allSelected;

        }

    }, [selectedCount, allSelected]);

    // ============================
    // TABLE COLUMNS
    // ============================

    const columns: TableColumn<MachineRow>[] = [

        // SELECT COLUMN

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
            render: (row) => (
                <input
                    type="checkbox"
                    checked={!!selected[row.machine_id]}
                    onChange={() =>
                        onToggleOne(row.machine_id)
                    }
                />
            ),
            align: "center",
        },

        {
            key: "machine_id",
            label: "Machine ID",
            align: "left",
        },

        {
            key: "machine_name",
            label: "Machine Name",
            align: "left",
        },

        {
            key: "machine_type",
            label: "Type",
            align: "center",
        },

        {
            key: "capabilities",
            label: "Capabilities",
            render: (row) =>
                row.capabilities.join(", "),
            align: "center",
        },

        {
            key: "assignedTask",
            label: "Assigned Task",
            render: (row) =>
                row.assignedTask ? (
                    <NavLink
                        to={`/tasks/${row.assignedTask.id}`}
                        className="blue-c"
                    >
                        {row.assignedTask.id}
                    </NavLink>
                ) : (
                    <span className="gray-c">
                        Idle
                    </span>
                ),
            align: "center",
        },

        {
            key: "status",
            label: "Status",
            render: (row) => {

                const cls =
                    row.status === "idle"
                        ? "status-unassigned"
                        : row.status === "busy"
                        ? "status-assigned"
                        : "status-inProgress";

                return (
                    <span
                        className={`status-badge ${cls}`}
                    >
                        {row.status}
                    </span>
                );

            },
            align: "center",
        },

        {
            key: "efficiency",
            label: "Efficiency (%)",
            render: (row) =>
                row.efficiency.toFixed(2),
            align: "center",
        },

        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="machine-actions">

                    <button
                        type="button"
                        className="machine-action-btn view"
                        onClick={() =>
                            onViewMachine(row.machine_id)
                        }
                        title="View"
                    >
                        <i className="fa-solid fa-eye"></i>
                    </button>

                    <button
                        type="button"
                        className="machine-action-btn edit"
                        onClick={() =>
                            onEditMachine(row.machine_id)
                        }
                        title="Edit"
                    >
                        <i className="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        className="machine-action-btn delete"
                        onClick={() =>
                            onDeleteMachine(
                                row.machine_id
                            )
                        }
                        title="Delete"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>

                </div>
            ),
            align: "center",
        },
    ];

    return (
        <ResponsiveTable<MachineRow>
            columns={columns}
            rows={machines}
            stickyHeader
            tableClassName="w-full"
            isLoading={isLoading}
            error={error ?? null}
        />
    );
};

export default MachinesTable;
