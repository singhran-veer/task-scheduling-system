import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import useGetActivityTimeline from "../../utils/hooks/api/useGetActivityTimeline";
import useGetAllTasks from "../../utils/hooks/api/useGetAllTasks";
import useGetDashboardOverview from "../../utils/hooks/api/useGetDashboardOverview";
import "./Dashboard.scss";

const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";

    const date = new Date(value);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
};

const formatActionLabel = (action: string) =>
    action
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const Dashboard = () => {
    const {
        data: dashboardData,
        isLoading: isLoadingDashboard,
        error: dashboardError,
    } = useGetDashboardOverview();
    const {
        data: tasksResponse,
        isLoading: isLoadingTasks,
        error: tasksError,
    } = useGetAllTasks({
        pageNumber: 1,
        limit: 6,
        filters: {},
    });
    const {
        data: activityResponse,
        isLoading: isLoadingActivity,
        error: activityError,
    } = useGetActivityTimeline(6);

    const isLoading = isLoadingDashboard || isLoadingTasks || isLoadingActivity;
    const error = dashboardError || tasksError || activityError;

    const tasks = tasksResponse?.data || [];
    const activities = activityResponse?.data || [];

    const highlightedTasks = useMemo(
        () =>
            [...tasks].sort((a, b) => {
                const statusWeight = (status: string) => {
                    if (status === "running") return 3;
                    if (status === "pending") return 2;
                    if (status === "scheduled") return 1;
                    return 0;
                };

                return statusWeight(b.status) - statusWeight(a.status) || b.priority - a.priority;
            }),
        [tasks]
    );

    const completionRate = dashboardData?.tasks.total
        ? (dashboardData.tasks.completed / dashboardData.tasks.total) * 100
        : 0;
    const availabilityRate = dashboardData?.machines.total
        ? (dashboardData.machines.idle / dashboardData.machines.total) * 100
        : 0;
    const maintenanceRate = dashboardData?.machines.total
        ? (dashboardData.machines.maintenance / dashboardData.machines.total) * 100
        : 0;

    const overviewCards = dashboardData
        ? [
              {
                  label: "Pending Tasks",
                  value: dashboardData.tasks.pending,
                  tone: "amber",
              },
              {
                  label: "Running Tasks",
                  value: dashboardData.tasks.running,
                  tone: "blue",
              },
              {
                  label: "Idle Machines",
                  value: dashboardData.machines.idle,
                  tone: "green",
              },
              {
                  label: "Maintenance",
                  value: dashboardData.machines.maintenance,
                  tone: "red",
              },
          ]
        : [];

    return (
        <AnimatedPage>
            <div className="dashboard-page main-page py-6">
                <div className="container">
                    <AnimatedComponent delay={0.08}>
                        <section className="dashboard-hero">
                            <div className="dashboard-hero-copy">
                                <span className="dashboard-eyebrow">Overview</span>
                                <h1>Dashboard</h1>
                                <p className="dashboard-subtitle">
                                    A fast visual read on production flow, machine readiness, and
                                    current operational pressure.
                                </p>
                            </div>

                            
                        </section>
                    </AnimatedComponent>

                    {isLoading ? (
                        <LoadingSpinner message="Loading dashboard..." />
                    ) : error ? (
                        <ErrorMessage message={error} />
                    ) : (
                        <>
                            <AnimatedComponent delay={0.14}>
                                <section className="dashboard-overview-band">
                                    <div className="dashboard-kpi-grid">
                                        {overviewCards.map((card) => (
                                            <article
                                                key={card.label}
                                                className={`dashboard-kpi-card ${card.tone}`}
                                            >
                                                <span>{card.label}</span>
                                                <strong>{card.value}</strong>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="dashboard-rings">
                                        <article className="dashboard-ring-card">
                                            <div
                                                className="dashboard-ring"
                                                title="Completed tasks as a percentage of total tasks"
                                                style={{
                                                    background: `conic-gradient(#39c9bb ${completionRate}%, #d8f8f5 0)`,
                                                }}
                                            >
                                                <div className="dashboard-ring-inner">
                                                    <strong>{completionRate.toFixed(0)}%</strong>
                                                    <span>Completed</span>
                                                </div>
                                            </div>
                                        </article>

                                        <article className="dashboard-ring-card">
                                            <div
                                                className="dashboard-ring blue"
                                                title="Idle machines as a percentage of total machines"
                                                style={{
                                                    background: `conic-gradient(#39c9bb ${availabilityRate}%,#d8f8f5 0)`,
                                                }}
                                            >
                                                <div className="dashboard-ring-inner">
                                                    <strong>{availabilityRate.toFixed(0)}%</strong>
                                                    <span>Available</span>
                                                </div>
                                            </div>
                                        </article>

                                        <article className="dashboard-ring-card">
                                            <div
                                                className="dashboard-ring red"
                                                title="Machines in maintenance as a percentage of total machines"
                                                style={{
                                                    background: `conic-gradient(#39c9bb ${maintenanceRate}%, #d8f8f5 0)`,
                                                }}
                                            >
                                                <div className="dashboard-ring-inner">
                                                    <strong>{maintenanceRate.toFixed(0)}%</strong>
                                                    <span>Maint.</span>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.2}>
                                <section className="dashboard-visual-grid">
                                    <article className="dashboard-panel white-bg shadow-md">
                                        <div className="dashboard-panel-heading">
                                            <h2>Production Pulse</h2>
                                            <p>How tasks and machine time are distributed right now.</p>
                                        </div>

                                        <div className="dashboard-pulse-stack">
                                            <div className="dashboard-bar-card">
                                                <div className="dashboard-bar-meta">
                                                    <span>Task Completion</span>
                                                    <strong>
                                                        {dashboardData?.tasks.completed || 0} /{" "}
                                                        {dashboardData?.tasks.total || 0}
                                                    </strong>
                                                </div>
                                                <div className="dashboard-progress-track lg">
                                                    <div
                                                        className="dashboard-progress-fill green"
                                                        style={{ width: `${completionRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="dashboard-bar-card">
                                                <div className="dashboard-bar-meta">
                                                    <span>Machine Availability</span>
                                                    <strong>
                                                        {dashboardData?.machines.idle || 0} /{" "}
                                                        {dashboardData?.machines.total || 0}
                                                    </strong>
                                                </div>
                                                <div className="dashboard-progress-track lg">
                                                    <div
                                                        className="dashboard-progress-fill blue"
                                                        style={{ width: `${availabilityRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="dashboard-time-grid">
                                                <div className="dashboard-time-card">
                                                    <span>Working Time</span>
                                                    <strong>
                                                        {dashboardData?.system.total_working_time || 0} mins
                                                    </strong>
                                                </div>
                                                <div className="dashboard-time-card">
                                                    <span>Idle Time</span>
                                                    <strong>
                                                        {dashboardData?.system.total_idle_time || 0} mins
                                                    </strong>
                                                </div>
                                                <div className="dashboard-time-card">
                                                    <span>Maintenance Time</span>
                                                    <strong>
                                                        {dashboardData?.system.total_maintenance_time || 0} mins
                                                    </strong>
                                                </div>
                                                <div className="dashboard-time-card accent">
                                                    <span>Efficiency</span>
                                                    <strong>
                                                        {dashboardData?.system.efficiency_percentage || "0.00"}%
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </article>

                                    <article className="dashboard-panel white-bg shadow-md">
                                        <div className="dashboard-panel-heading">
                                            <h2>Priority Queue</h2>
                                            <p>The first tasks operators should be watching.</p>
                                        </div>

                                        <div className="dashboard-task-stack">
                                            {highlightedTasks.length ? (
                                                highlightedTasks.map((task) => (
                                                    <div
                                                        key={task.task_id}
                                                        className="dashboard-task-card"
                                                    >
                                                        <div>
                                                            <strong>{task.task_name}</strong>
                                                            <p>
                                                                {task.task_id} · {task.task_type}
                                                            </p>
                                                        </div>
                                                        <div className="dashboard-task-meta">
                                                            <span className="dashboard-priority-pill">
                                                                P{task.priority}
                                                            </span>
                                                            <span
                                                                className={`dashboard-status-pill ${task.status}`}
                                                            >
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dashboard-empty-card">
                                                    No task data found.
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                </section>
                            </AnimatedComponent>

                            <AnimatedComponent delay={0.26}>
                                <section className="dashboard-bottom-grid">
                                    <article className="dashboard-panel white-bg shadow-md">
                                        <div className="dashboard-panel-heading">
                                            <h2>Recent Activity</h2>
                                            <p>Latest events across tasks, machines, and scheduler runs.</p>
                                        </div>

                                        <div className="dashboard-activity-list">
                                            {activities.length ? (
                                                activities.map((item, index) => (
                                                    <div
                                                        key={`${item._id || item.entity_id}-${index}`}
                                                        className="dashboard-activity-card"
                                                    >
                                                        <div className="dashboard-activity-meta">
                                                            <span className={`dashboard-entity-pill ${item.entity_type}`}>
                                                                {item.entity_type}
                                                            </span>
                                                            <span>{formatDateTime(item.action_time)}</span>
                                                        </div>
                                                        <strong>{formatActionLabel(item.action)}</strong>
                                                        <p>{item.entity_id}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dashboard-empty-card">
                                                    No recent activity available.
                                                </div>
                                            )}
                                        </div>

                                        <div className="dashboard-activity-link-row">
                                            <NavLink to="/activity" className="dashboard-inline-link">
                                                View full activity feed
                                            </NavLink>
                                        </div>
                                    </article>

                                    <article className="dashboard-panel white-bg shadow-md">
                                        <div className="dashboard-panel-heading">
                                            <h2>Quick Take</h2>
                                            <p>Short operational summary from current numbers.</p>
                                        </div>

                                        <div className="dashboard-insight-stack">
                                            <div className="dashboard-insight-card">
                                                <span>Task Pressure</span>
                                                <strong>
                                                    {dashboardData?.tasks.pending || 0} task(s) still waiting
                                                    to start
                                                </strong>
                                            </div>
                                            <div className="dashboard-insight-card">
                                                <span>Machine Pressure</span>
                                                <strong>
                                                    {dashboardData?.machines.maintenance || 0} machine(s) are
                                                    unavailable due to maintenance
                                                </strong>
                                            </div>
                                            <div className="dashboard-insight-card">
                                                <span>System State</span>
                                                <strong>
                                                    {Number(dashboardData?.machines.utilization_percentage || 0) >
                                                    70
                                                        ? "The floor is heavily utilized right now."
                                                        : "There is still machine capacity available."}
                                                </strong>
                                            </div>
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

export default Dashboard;
