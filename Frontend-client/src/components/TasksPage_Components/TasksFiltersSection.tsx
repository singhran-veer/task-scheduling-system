import type { Dispatch, SetStateAction } from "react";

interface TaskSearchBy {
    taskIdOrName: string;
    taskType: string;
    status: string;
    requiredMachineType: string;
}

interface Props {
    searchBy: TaskSearchBy;
    setSearchBy: Dispatch<SetStateAction<TaskSearchBy>>;
    showFilters: boolean;
    onToggleFilters: () => void;
    clearFilters: () => void;
}

const TasksFiltersSection = ({
    searchBy,
    setSearchBy,
    showFilters,
    onToggleFilters,
    clearFilters,
}: Props) => {
    return (
        <section className="tasks-filters-wrapper">
            <div className="tasks-section-toggle">
                <button
                    type="button"
                    className="tasks-toggle-btn"
                    onClick={onToggleFilters}
                >
                    <span>Filters & Actions</span>
                    <i
                        className={`fa-solid fa-chevron-${showFilters ? "up" : "down"}`}
                    ></i>
                </button>
            </div>

            {showFilters && (
                <div className="tasks-filters-card white-bg shadow-md">
                    <label className="tasks-filter-field tasks-filter-field-full">
                        <span>Search</span>
                        <input
                            type="text"
                            placeholder="Search by task ID, task name, or type..."
                            value={searchBy.taskIdOrName}
                            onChange={(e) =>
                                setSearchBy((prev) => ({
                                    ...prev,
                                    taskIdOrName: e.target.value,
                                }))
                            }
                        />
                    </label>

                    <div className="tasks-filters-grid">
                        <label className="tasks-filter-field">
                            <span>Task Type</span>
                            <input
                                type="text"
                                placeholder="Assembly, cutting, welding..."
                                value={searchBy.taskType}
                                onChange={(e) =>
                                    setSearchBy((prev) => ({
                                        ...prev,
                                        taskType: e.target.value,
                                    }))
                                }
                            />
                        </label>

                        <label className="tasks-filter-field">
                            <span>Status</span>
                            <select
                                value={searchBy.status}
                                onChange={(e) =>
                                    setSearchBy((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="running">Running</option>
                                <option value="completed">Completed</option>
                            </select>
                        </label>

                        <label className="tasks-filter-field">
                            <span>Required Machine Type</span>
                            <input
                                type="text"
                                placeholder="CNC, laser, press..."
                                value={searchBy.requiredMachineType}
                                onChange={(e) =>
                                    setSearchBy((prev) => ({
                                        ...prev,
                                        requiredMachineType: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <div className="tasks-filter-spacer"></div>
                    </div>

                    <div className="tasks-clear-row">
                        <button
                            type="button"
                            className="tasks-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TasksFiltersSection;
