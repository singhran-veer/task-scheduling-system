import { useMemo } from "react";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";
import AnimatedButton from "../../common/Animations/AnimatedButton/AnimatedButton";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import type { MachineRow, TaskRow } from "../../common/Types/Interfaces";
import useGetActivityTimeline, {
    type ActivityTimelineItem,
} from "../../utils/hooks/api/useGetActivityTimeline";
import useGetAllMachines from "../../utils/hooks/api/useGetAllMachines";
import useGetAllTasks from "../../utils/hooks/api/useGetAllTasks";
import useRunScheduler from "../../utils/hooks/api/useRunScheduler";
import "./SchedulerPage.scss";

const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";

    const date = new Date(value);

    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
};

const getTaskPriorityLabel = (priority: number) => {
    if (priority >= 5) return "Critical";
    if (priority >= 4) return "High";
    if (priority >= 3) return "Medium";
    return "Normal";
};

const inferUnscheduledReason = (task: TaskRow, machines: MachineRow[]) => {
    const sameTypeMachines = machines.filter(
        (machine) =>
            machine.machine_type?.toLowerCase() ===
            task.required_machine_type?.toLowerCase()
    );

    if (!sameTypeMachines.length) {
        return "No machine with the required type is available.";
    }

    const capableMachines = sameTypeMachines.filter((machine) =>
        task.required_capabilities.every((capability) =>
            machine.capabilities?.includes(capability)
        )
    );

    if (!capableMachines.length) {
        return "Matching machines do not support the required capabilities.";
    }

    const idleCapableMachines = capableMachines.filter(
        (machine) => machine.status === "idle"
    );

    if (!idleCapableMachines.length) {
        return "All capable machines are currently busy or under maintenance.";
    }

    return "Waiting for scheduler execution.";
};

const SchedulerPage = () => {
    const { runScheduler, isPending: isRunningScheduler } = useRunScheduler();
    const {
        data: tasksResponse,
        isLoading: isLoadingTasks,
        error: tasksError,
    } = useGetAllTasks({
        pageNumber: 1,
        limit: 200,
        filters: {},
    });
    const {
        data: machinesResponse,
        isLoading: isLoadingMachines,
        error: machinesError,
    } = useGetAllMachines({
        pageNumber: 1,
        limit: 200,
        filters: {},
    });
    const {
        data: activityResponse,
        isLoading: isLoadingActivity,
        error: activityError,
    } = useGetActivityTimeline(100);

    const tasks: TaskRow[] = tasksResponse?.data || [];
    const machines: MachineRow[] = machinesResponse?.data || [];
    const activityItems: ActivityTimelineItem[] = activityResponse?.data || [];

    const filteredTasks = useMemo(() => {
        return tasks.filter((task: TaskRow) => {
            return Boolean(task);
        });
    }, [tasks]);

    const filteredMachines = useMemo(() => {
        return machines.filter((machine: MachineRow) => {
            return Boolean(machine);
        });
    }, [machines]);

    const activeAssignments = filteredTasks.filter(
        (task) => task.status === "running" || task.status === "scheduled"
    );

    const unscheduledTasks = filteredTasks
        .filter((task) => task.status === "pending")
        .map((task) => ({
            ...task,
            reason: inferUnscheduledReason(task, machines),
        }));

    const schedulerActivity = activityItems.filter(
        (item) =>
            item.entity_type === "system" ||
            item.action.includes("scheduler") ||
            item.action.includes("task_assigned")
    );

    const latestSchedulerRun = schedulerActivity.find(
        (item) => item.action === "scheduler_run"
    );

    const schedulerStats = {
        pendingTasks: tasks.filter((task) => task.status === "pending").length,
        runningTasks: tasks.filter((task) => task.status === "running").length,
        idleMachines: machines.filter((machine) => machine.status === "idle").length,
        busyMachines: machines.filter((machine) => machine.status === "busy").length,
        tasksAssignedLastRun:
            (latestSchedulerRun?.details?.tasks_assigned as number | undefined) || 0,
        tasksCheckedLastRun:
            (latestSchedulerRun?.details?.tasks_checked as number | undefined) || 0,
    };

    const isLoading = isLoadingTasks || isLoadingMachines || isLoadingActivity;
    const error = tasksError || machinesError || activityError;

    return (
        <AnimatedPage>
            <div className="scheduler-page main-page py-6">
                <div className="container">
                    <AnimatedComponent delay={0.08}>
                        <section className="scheduler-hero">
                            <div>
                                <h1>Scheduler</h1>
                                <p className="scheduler-subtitle">
                                    Run the manufacturing scheduler, review machine load, and inspect
                                    why tasks were assigned or left waiting.
                                </p>
                            </div>

                            <div className="scheduler-header-actions">
                                <AnimatedButton
                                    variant="success"
                                    className="scheduler-run-btn"
                                    onClick={() => runScheduler()}
                                    disabled={isRunningScheduler}
                                >
                                    <i className="fa-solid fa-gears"></i>
                                    {isRunningScheduler ? "Running..." : "Run Scheduler"}
                                </AnimatedButton>
                            </div>
                        </section>
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.14}>
                        <section className="scheduler-stats-grid">
                            <article className="scheduler-stat-card">
                                <span>Pending Tasks</span>
                                <strong>{schedulerStats.pendingTasks}</strong>
                            </article>
                            <article className="scheduler-stat-card running">
                                <span>Running Tasks</span>
                                <strong>{schedulerStats.runningTasks}</strong>
                            </article>
                            <article className="scheduler-stat-card idle">
                                <span>Idle Machines</span>
                                <strong>{schedulerStats.idleMachines}</strong>
                            </article>
                            <article className="scheduler-stat-card busy">
                                <span>Busy Machines</span>
                                <strong>{schedulerStats.busyMachines}</strong>
                            </article>
                            <article className="scheduler-stat-card success">
                                <span>Assigned Last Run</span>
                                <strong>{schedulerStats.tasksAssignedLastRun}</strong>
                            </article>
                            <article className="scheduler-stat-card neutral">
                                <span>Checked Last Run</span>
                                <strong>{schedulerStats.tasksCheckedLastRun}</strong>
                            </article>
                        </section>
                    </AnimatedComponent>

                    {isLoading ? (
                        <LoadingSpinner message="Loading scheduler overview..." />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <>
                            <AnimatedComponent delay={0.2}>
                                <section className="scheduler-grid">
                                    <article className="scheduler-panel white-bg shadow-md">
                                        <div className="scheduler-panel-heading">
                                            <h2>Active Assignments</h2>
                                            <p>Tasks currently running or already scheduled.</p>
                                        </div>

                                        <div className="scheduler-table-wrap">
                                            <table className="scheduler-table">
                                                <thead>
                                                    <tr>
                                                        <th>Task</th>
                                                        <th>Priority</th>
                                                        <th>Machine</th>
                                                        <th>Deadline</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {activeAssignments.length ? (
                                                        activeAssignments.map((task) => (
                                                            <tr key={task.task_id}>
                                                                <td>{task.task_id}</td>
                                                                <td>{getTaskPriorityLabel(task.priority)}</td>
                                                                <td>
                                                                    {task.assignedMachine?.name ||
                                                                        task.assignedMachine_id ||
                                                                        "Unassigned"}
                                                                </td>
                                                                <td>{formatDateTime(task.deadline)}</td>
                                                                <td>
                                                                    <span
                                                                        className={`scheduler-pill task-${task.status}`}
                                                                    >
                                                                        {task.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="scheduler-empty">
                                                                No active assignments found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>

                                    <article className="scheduler-panel white-bg shadow-md">
                                        <div className="scheduler-panel-heading">
                                            <h2>Unscheduled Tasks</h2>
                                            <p>Pending tasks that still need machine allocation.</p>
                                        </div>

                                        <div className="scheduler-list">
                                            {unscheduledTasks.length ? (
                                                unscheduledTasks.map((task) => (
                                                    <div
                                                        key={task.task_id}
                                                        className="scheduler-list-card"
                                                    >
                                                        <div>
                                                            <h3>{task.task_name}</h3>
                                                            <p>
                                                                {task.task_id} - {task.required_machine_type}
                                                            </p>
                                                        </div>
                                                        <span className="scheduler-priority-chip">
                                                            {getTaskPriorityLabel(task.priority)}
                                                        </span>
                                                        <p className="scheduler-reason">
                                                            {task.reason}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="scheduler-empty-card">
                                                    No pending tasks found.
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.26}>
                                <section className="scheduler-grid">
                                    <article className="scheduler-panel white-bg shadow-md">
                                        <div className="scheduler-panel-heading">
                                            <h2>Machine Load</h2>
                                            <p>Current readiness and utilization indicators.</p>
                                        </div>

                                        <div className="scheduler-table-wrap">
                                            <table className="scheduler-table">
                                                <thead>
                                                    <tr>
                                                        <th>Machine</th>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                        <th>Working Time</th>
                                                        <th>Efficiency</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredMachines.length ? (
                                                        filteredMachines.map((machine) => (
                                                            <tr key={machine.machine_id}>
                                                                <td>{machine.machine_id}</td>
                                                                <td>{machine.machine_type}</td>
                                                                <td>
                                                                    <span
                                                                        className={`scheduler-pill machine-${machine.status}`}
                                                                    >
                                                                        {machine.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {Number(
                                                                        machine.total_working_time || 0
                                                                    ).toFixed(0)}{" "}
                                                                    mins
                                                                </td>
                                                                <td>
                                                                    {Number(
                                                                        machine.efficiency || 0
                                                                    ).toFixed(2)}
                                                                    %
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="scheduler-empty">
                                                                No machine load data found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>

                                    <article className="scheduler-panel white-bg shadow-md">
                                        <div className="scheduler-panel-heading">
                                            <h2>Recent Scheduler Activity</h2>
                                            <p>Latest assignment and scheduler events.</p>
                                        </div>

                                        <div className="scheduler-activity-list">
                                            {schedulerActivity.length ? (
                                                schedulerActivity.slice(0, 8).map((item, index) => (
                                                    <div
                                                        key={`${item._id || item.entity_id}-${index}`}
                                                        className="scheduler-activity-item"
                                                    >
                                                        <div className="scheduler-activity-time">
                                                            <i className="fa-regular fa-clock"></i>
                                                            <span>{formatDateTime(item.action_time)}</span>
                                                        </div>
                                                        <strong>
                                                            {item.action
                                                                .split("_")
                                                                .map(
                                                                    (part) =>
                                                                        part.charAt(0).toUpperCase() +
                                                                        part.slice(1)
                                                                )
                                                                .join(" ")}
                                                        </strong>
                                                        <p>
                                                            {item.entity_type === "system"
                                                                ? "Scheduler event"
                                                                : `${item.entity_type} ${item.entity_id}`}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="scheduler-empty-card">
                                                    No scheduler activity has been logged yet.
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </section>
                            </AnimatedComponent>
                        </>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default SchedulerPage;
