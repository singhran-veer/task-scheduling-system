import { useMemo } from "react";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import type { MachineRow, TaskRow } from "../../common/Types/Interfaces";
import useGetActivityTimeline, {
    type ActivityTimelineItem,
} from "../../utils/hooks/api/useGetActivityTimeline";
import useGetAllMachines from "../../utils/hooks/api/useGetAllMachines";
import useGetAllTasks from "../../utils/hooks/api/useGetAllTasks";
import "./AnalyticsPage.scss";

const toPercent = (value: number) => `${value.toFixed(0)}%`;

const getRatio = (value: number, total: number) =>
    total > 0 ? Math.min(100, (value / total) * 100) : 0;

const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";

    const date = new Date(value);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
};

const buildTaskStatusData = (tasks: TaskRow[]) => {
    const total = tasks.length;

    return [
        {
            label: "Pending",
            value: tasks.filter((task) => task.status === "pending").length,
            colorClass: "amber",
            total,
        },
        {
            label: "Running",
            value: tasks.filter((task) => task.status === "running").length,
            colorClass: "blue",
            total,
        },
        {
            label: "Scheduled",
            value: tasks.filter((task) => task.status === "scheduled").length,
            colorClass: "cyan",
            total,
        },
        {
            label: "Completed",
            value: tasks.filter((task) => task.status === "completed").length,
            colorClass: "green",
            total,
        },
    ];
};

const buildMachineStatusData = (machines: MachineRow[]) => {
    const total = machines.length;

    return [
        {
            label: "Idle",
            value: machines.filter((machine) => machine.status === "idle").length,
            colorClass: "amber",
            total,
        },
        {
            label: "Busy",
            value: machines.filter((machine) => machine.status === "busy").length,
            colorClass: "blue",
            total,
        },
        {
            label: "Maintenance",
            value: machines.filter((machine) => machine.status === "maintenance").length,
            colorClass: "red",
            total,
        },
    ];
};

const AnalyticsPage = () => {
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
    } = useGetActivityTimeline(200);

    const tasks: TaskRow[] = tasksResponse?.data || [];
    const machines: MachineRow[] = machinesResponse?.data || [];
    const activity: ActivityTimelineItem[] = activityResponse?.data || [];

    const taskStatusData = useMemo(() => buildTaskStatusData(tasks), [tasks]);
    const machineStatusData = useMemo(
        () => buildMachineStatusData(machines),
        [machines]
    );

    const topMachines = useMemo(
        () =>
            [...machines]
                .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
                .slice(0, 5),
        [machines]
    );

    const machineTypeDemand = useMemo(() => {
        const demandMap = tasks.reduce<Record<string, number>>((acc, task) => {
            const key = task.required_machine_type || "Unknown";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(demandMap)
            .map(([machineType, count]) => ({ machineType, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [tasks]);

    const schedulerRuns = activity.filter((item) => item.action === "scheduler_run");
    const lastSchedulerRun = schedulerRuns[0];
    const avgEfficiency =
        machines.length > 0
            ? machines.reduce((sum, machine) => sum + (machine.efficiency || 0), 0) /
              machines.length
            : 0;
    const schedulerSuccessRate =
        lastSchedulerRun &&
        typeof lastSchedulerRun.details?.tasks_checked === "number" &&
        lastSchedulerRun.details.tasks_checked > 0 &&
        typeof lastSchedulerRun.details?.tasks_assigned === "number"
            ? (lastSchedulerRun.details.tasks_assigned /
                  lastSchedulerRun.details.tasks_checked) *
              100
            : 0;

    const totalWorkingTime = machines.reduce(
        (sum: number, machine: MachineRow) =>
            sum + Number(machine.total_working_time || 0),
        0
    );
    const totalIdleTime = machines.reduce(
        (sum: number, machine: MachineRow) =>
            sum + Number(machine.total_idle_time || 0),
        0
    );
    const totalMaintenanceTime = machines.reduce(
        (sum: number, machine: MachineRow) =>
            sum + Number(machine.total_maintenance_time || 0),
        0
    );
    const utilizationRate =
        totalWorkingTime + totalIdleTime > 0
            ? (totalWorkingTime / (totalWorkingTime + totalIdleTime)) * 100
            : 0;

    const insights = [
        machineTypeDemand[0]
            ? `${machineTypeDemand[0].machineType} tasks are creating the highest current demand.`
            : "Task demand insights will appear once tasks are created.",
        schedulerSuccessRate > 0
            ? `The latest scheduler run placed ${toPercent(
                  schedulerSuccessRate
              )} of the checked pending tasks.`
            : "Scheduler success rate will appear after the next scheduler run.",
        machines.some((machine) => machine.status === "maintenance")
            ? `${machines.filter((machine) => machine.status === "maintenance").length} machine(s) are currently in maintenance and may reduce capacity.`
            : "No machines are currently marked for maintenance.",
    ];

    const isLoading = isLoadingTasks || isLoadingMachines || isLoadingActivity;
    const error = tasksError || machinesError || activityError;

    return (
        <AnimatedPage>
            <div className="analytics-page main-page py-6">
                <div className="container">
                    <AnimatedComponent delay={0.08}>
                        <section className="analytics-hero">
                            <div>
                                <h1>Analytics</h1>
                                <p className="analytics-subtitle">
                                    Review machine utilization, task flow, and scheduler
                                    performance across the plant.
                                </p>
                            </div>
                        </section>
                    </AnimatedComponent>

                    {isLoading ? (
                        <LoadingSpinner message="Loading analytics..." />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <>
                            <AnimatedComponent delay={0.14}>
                                <section className="analytics-kpi-grid">
                                    <article className="analytics-kpi-card">
                                        <span>Total Tasks</span>
                                        <strong>{tasks.length}</strong>
                                    </article>
                                    <article className="analytics-kpi-card blue">
                                        <span>Total Machines</span>
                                        <strong>{machines.length}</strong>
                                    </article>
                                    <article className="analytics-kpi-card green">
                                        <span>Avg. Efficiency</span>
                                        <strong>{avgEfficiency.toFixed(1)}%</strong>
                                    </article>
                                    <article className="analytics-kpi-card amber">
                                        <span>Utilization Rate</span>
                                        <strong>{utilizationRate.toFixed(1)}%</strong>
                                    </article>
                                    <article className="analytics-kpi-card red">
                                        <span>Maintenance Time</span>
                                        <strong>{totalMaintenanceTime.toFixed(0)} mins</strong>
                                    </article>
                                    <article className="analytics-kpi-card teal">
                                        <span>Scheduler Success</span>
                                        <strong>{schedulerSuccessRate.toFixed(0)}%</strong>
                                    </article>
                                    <article className="analytics-kpi-card violet">
                                        <span>Last Scheduler Run</span>
                                        <strong className="analytics-kpi-small">
                                            {lastSchedulerRun
                                                ? formatDateTime(lastSchedulerRun.action_time)
                                                : "Not run yet"}
                                        </strong>
                                    </article>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.2}>
                                <section className="analytics-grid">
                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Task Status Breakdown</h2>
                                            <p>Current flow of manufacturing tasks.</p>
                                        </div>
                                        <div className="analytics-bar-list">
                                            {taskStatusData.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="analytics-bar-row"
                                                >
                                                    <div className="analytics-bar-meta">
                                                        <span>{item.label}</span>
                                                        <strong>{item.value}</strong>
                                                    </div>
                                                    <div className="analytics-bar-track">
                                                        <div
                                                            className={`analytics-bar-fill ${item.colorClass}`}
                                                            style={{
                                                                width: `${getRatio(
                                                                    item.value,
                                                                    item.total
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </article>

                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Machine Status Breakdown</h2>
                                            <p>Readiness across your available equipment.</p>
                                        </div>
                                        <div className="analytics-bar-list">
                                            {machineStatusData.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className="analytics-bar-row"
                                                >
                                                    <div className="analytics-bar-meta">
                                                        <span>{item.label}</span>
                                                        <strong>{item.value}</strong>
                                                    </div>
                                                    <div className="analytics-bar-track">
                                                        <div
                                                            className={`analytics-bar-fill ${item.colorClass}`}
                                                            style={{
                                                                width: `${getRatio(
                                                                    item.value,
                                                                    item.total
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </article>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.26}>
                                <section className="analytics-grid">
                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Top Machine Efficiency</h2>
                                            <p>Best-performing machines based on current efficiency.</p>
                                        </div>
                                        <div className="analytics-table-wrap">
                                            <table className="analytics-table">
                                                <thead>
                                                    <tr>
                                                        <th>Machine</th>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                        <th>Efficiency</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topMachines.length ? (
                                                        topMachines.map((machine) => (
                                                            <tr key={machine.machine_id}>
                                                                <td>{machine.machine_id}</td>
                                                                <td>{machine.machine_type}</td>
                                                                <td>{machine.status}</td>
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
                                                            <td colSpan={4} className="analytics-empty">
                                                                No machine efficiency data found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </article>

                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Backlog By Machine Type</h2>
                                            <p>Where demand is currently concentrating.</p>
                                        </div>
                                        <div className="analytics-list">
                                            {machineTypeDemand.length ? (
                                                machineTypeDemand.map((item) => (
                                                    <div
                                                        key={item.machineType}
                                                        className="analytics-list-card"
                                                    >
                                                        <div>
                                                            <h3>{item.machineType}</h3>
                                                            <p>
                                                                {item.count} task(s) currently require this
                                                                machine type
                                                            </p>
                                                        </div>
                                                        <span className="analytics-count-pill">
                                                            {item.count}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="analytics-empty-card">
                                                    No machine-type demand data yet.
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.32}>
                                <section className="analytics-grid">
                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Scheduler Activity</h2>
                                            <p>Recent system-level scheduling events.</p>
                                        </div>
                                        <div className="analytics-list">
                                            {schedulerRuns.length ? (
                                                schedulerRuns.slice(0, 6).map((item, index) => (
                                                    <div
                                                        key={`${item._id || item.entity_id}-${index}`}
                                                        className="analytics-list-card"
                                                    >
                                                        <div>
                                                            <h3>Scheduler Run</h3>
                                                            <p>{formatDateTime(item.action_time)}</p>
                                                        </div>
                                                        <span className="analytics-count-pill">
                                                            {String(
                                                                item.details?.tasks_assigned || 0
                                                            )}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="analytics-empty-card">
                                                    No scheduler runs have been recorded yet.
                                                </div>
                                            )}
                                        </div>
                                    </article>

                                    <article className="analytics-panel white-bg shadow-md">
                                        <div className="analytics-panel-heading">
                                            <h2>Insights</h2>
                                            <p>Quick observations from current operations data.</p>
                                        </div>
                                        <div className="analytics-insights">
                                            {insights.map((insight) => (
                                                <div key={insight} className="analytics-insight-card">
                                                    {insight}
                                                </div>
                                            ))}
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

export default AnalyticsPage;
