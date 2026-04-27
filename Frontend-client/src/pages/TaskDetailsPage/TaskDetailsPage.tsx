import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import "./TaskDetailsPage.scss";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import PageHeader from "../../components/Headings/PageHeader/PageHeader";
import BackButton from "../../components/BackButton/BackButton";
import LoadingPageSpinner from "../../components/LoadingPageSpinner/LoadingPageSpinner";
import useGetTaskDetails from "../../utils/hooks/api/useGetTaskDetails";
import useCompleteTask from "../../utils/hooks/api/useCompleteTask";
import type { TaskRow } from "../../common/Types/Interfaces";
import { useState } from "react";
import EditTaskModal from "../../components/TasksPage_Components/EditTaskModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import useDeleteTask from "../../utils/hooks/api/useDeleteTask";

const formatDateTime = (value?: string) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
};

const TaskDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const fallbackTask = (location.state as { task?: TaskRow } | null)?.task;
    const { data, isLoading, error } = useGetTaskDetails(id || "");
    const { completeTask, isPending } = useCompleteTask();
    const { deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const task = data || fallbackTask;
    const currentMachineId =
        task.status === "completed" ? null : task.assignedMachine_id;
    const previousMachineId =
        task.status === "completed"
            ? task.lastMachine_id || task.assignedMachine_id || null
            : task.lastMachine_id || null;
    const previousMachineName =
        (task as TaskRow & {
            previousMachine?: { name?: string | null };
        }).previousMachine?.name || previousMachineId;
    const taskTimeUnit = task.time_unit || "minutes";
    const activityItems = [
        { label: "Task created", time: task.created_at },
        { label: "Task assigned", time: task.assigned_at },
        {
            label: "Task completed",
            time:
                task.completed_at ||
                (task.status === "completed" ? task.updated_at || task.created_at : undefined),
        },
        { label: "Task updated", time: task.updated_at },
    ].filter((item, index, array) => {
        if (!item.time) return false;
        return (
            array.findIndex(
                (candidate) =>
                    candidate.label === item.label && candidate.time === item.time
            ) === index
        );
    });

    if (isLoading && !task) {
        return <LoadingPageSpinner message="Loading task details..." />;
    }

    if (error && !task) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    if (!task) {
        return <div className="p-6">Task not found</div>;
    }

    return (
        <AnimatedPage>
            <div className="main-page py-6 task-details-page">
                <div className="container space-y-6">
                    <div className="header-container flex items-center gap-2 justify-between">
                        <PageHeader
                            title="Task Details"
                            subtitle="View task requirements, assignment status, and production history."
                        />
                        <BackButton />
                    </div>

                    <main className="task-details-container mt-8">
                        <section className="task-summary-card white-bg shadow-md">
                            <div className="task-summary-top">
                                <div>
                                    <h2>
                                        Task <span>{task.task_id}</span>
                                    </h2>
                                    <p>{task.task_name}</p>
                                </div>

                                <span
                                    className={`status-badge ${
                                        task.status === "completed"
                                            ? "status-assigned"
                                            : task.status === "running"
                                            ? "status-inProgress"
                                            : "status-unassigned"
                                    }`}
                                >
                                    {task.status}
                                </span>
                            </div>

                            <div className="task-summary-actions">
                                <button
                                    type="button"
                                    className="main-btn blue-bg"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <i className="fa-solid fa-pen mr-2"></i>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="main-btn red-bg"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <i className="fa-solid fa-trash mr-2"></i>
                                    Delete
                                </button>
                                {task.status === "running" && (
                                    <button
                                        type="button"
                                        className="main-btn green-bg"
                                        onClick={() => completeTask(task.task_id)}
                                        disabled={isPending}
                                    >
                                        <i className="fa-solid fa-circle-check mr-2"></i>
                                        {isPending ? "Completing..." : "Complete"}
                                    </button>
                                )}
                            </div>

                            
                        </section>

                        <div className="task-details-grid">
                            <section className="white-bg p-6 rounded-lg shadow-md task-details-card task-block-wide">
                                <h3 className="task-section-title">Task Information</h3>
                                <div className="task-info-grid">
                                    <article className="task-info-tile">
                                        <span>Task Type</span>
                                        <strong>{task.task_type}</strong>
                                    </article>
                                    <article className="task-info-tile">
                                        <span>Required Machine Type</span>
                                        <strong>{task.required_machine_type}</strong>
                                    </article>
                                    <article className="task-info-tile">
                                        <span>Priority</span>
                                        <strong>{task.priority}</strong>
                                    </article>
                                    <article className="task-info-tile">
                                        <span>Duration</span>
                                        <strong>{task.duration} {taskTimeUnit}</strong>
                                    </article>
                                    <article className="task-info-tile">
                                        <span>Deadline</span>
                                        <strong>{formatDateTime(task.deadline)}</strong>
                                    </article>
                                    <article className="task-info-tile">
                                        <span>Arrival Time</span>
                                        <strong>{formatDateTime(task.arrival_time)}</strong>
                                    </article>
                                </div>
                            </section>

                          

                            <section className="white-bg p-6 rounded-lg shadow-md task-details-card task-block-wide">
                                <h3 className="task-section-title">Machine Assignment</h3>
                                <div className="task-assignment-stack">
                                    <div className="task-assignment-card">
                                        <div className="task-assignment-icon">
                                            <i className="fa-solid fa-industry"></i>
                                        </div>
                                        <div>
                                            <span>Current Machine</span>
                                            {currentMachineId ? (
                                                <NavLink
                                                    to={`/machines/${currentMachineId}`}
                                                    className="blue-c font-medium"
                                                >
                                                    {task.assignedMachine?.name || currentMachineId}
                                                </NavLink>
                                            ) : (
                                                <strong>No machine currently assigned</strong>
                                            )}
                                        </div>
                                    </div>

                                    <div className="task-assignment-card">
                                        <div className="task-assignment-icon muted">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        <div>
                                            <span>Previous Machine</span>
                                            <strong>{previousMachineName || "No machine assigned before"}</strong>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="white-bg p-6 rounded-lg shadow-md task-details-card">
                                <h3 className="task-section-title">Activity</h3>
                                <div className="task-activity-list">
                                    {activityItems.map((item) => (
                                        <article
                                            key={`${item.label}-${item.time}`}
                                            className="task-activity-card"
                                        >
                                            <div className="task-activity-meta">
                                                <span>
                                                    <i className="fa-solid fa-calendar"></i>
                                                    {new Date(item.time as string).toLocaleDateString()}
                                                </span>
                                                <span>
                                                    <i className="fa-solid fa-clock"></i>
                                                    {new Date(item.time as string).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <strong>{item.label}</strong>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>

            <EditTaskModal
                isOpen={isEditModalOpen}
                taskId={task.task_id}
                task={task}
                onClose={() => setIsEditModalOpen(false)}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    await deleteTask(task.task_id);
                    navigate("/tasks");
                }}
                title="Delete Task"
                message={`Are you sure you want to delete task ${task.task_id}?`}
                confirmButtonText="Delete Task"
                isLoading={isDeletingTask}
            />
        </AnimatedPage>
    );
};

export default TaskDetailsPage;
