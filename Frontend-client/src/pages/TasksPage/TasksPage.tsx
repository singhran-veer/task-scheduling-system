import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./TasksPage.scss";
import BulkActionsBar from "../../components/BulkActionsBar/BulkActionsBar";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import Pagination from "../../components/Pagination/Pagination";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";
import TasksControls from "../../components/TasksPage_Components/TasksControls";
import TasksFiltersSection from "../../components/TasksPage_Components/TasksFiltersSection";
import TasksTable from "../../components/TasksPage_Components/TasksTable";
import AddTaskModal from "../../components/TasksPage_Components/AddTaskModal";
import EditTaskModal from "../../components/TasksPage_Components/EditTaskModal";
import useGetAllTasks from "../../utils/hooks/api/useGetAllTasks";
import useDeleteTask from "../../utils/hooks/api/useDeleteTask";
import useDeleteSelectedTasks from "../../utils/hooks/api/useDeleteSelectedTasks";
import useRunScheduler from "../../utils/hooks/api/useRunScheduler";
import useCompleteTask from "../../utils/hooks/api/useCompleteTask";
import type { TaskRow } from "../../common/Types/Interfaces";

interface TaskSearchBy {
    taskIdOrName: string;
    taskType: string;
    status: string;
    requiredMachineType: string;
}

const TasksPage = () => {
    const [paginationInfo, setPaginationInfo] = useState({
        pageNumber: 1,
        totalPages: 1,
        totalDocs: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [searchBy, setSearchBy] = useState<TaskSearchBy>({
        taskIdOrName: "",
        taskType: "",
        status: "",
        requiredMachineType: "",
    });

    useEffect(() => {
        setPaginationInfo((prev) => ({
            ...prev,
            pageNumber: 1,
        }));
    }, [searchBy]);

    const { data: fetchedTasksData, isLoading, error } = useGetAllTasks({
        pageNumber: paginationInfo.pageNumber,
        limit: 10,
        filters: searchBy,
    });

    const [tasks, setTasks] = useState<TaskRow[]>([]);

    useEffect(() => {
        if (!fetchedTasksData) return;

        setTasks(fetchedTasksData.data || []);
        setPaginationInfo({
            pageNumber: fetchedTasksData.currentPage || 1,
            totalPages: fetchedTasksData.totalPages || 1,
            totalDocs: fetchedTasksData.totalDocs || 0,
            hasNextPage: fetchedTasksData.hasNextPage || false,
            hasPreviousPage: fetchedTasksData.hasPreviousPage || false,
        });
    }, [fetchedTasksData]);

    const [selected, setSelected] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setSelected({});
    }, [tasks]);

    const selectedCount = Object.values(selected).filter(Boolean).length;
    const allSelected = tasks.length > 0 && tasks.every((task) => selected[task.task_id]);

    const toggleAll = () => {
        const next: Record<string, boolean> = {};
        tasks.forEach((task) => {
            next[task.task_id] = !allSelected;
        });
        setSelected(next);
    };

    const toggleOne = (taskId: string) => {
        setSelected((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const { deleteTask, isPending: isDeletingTask } = useDeleteTask();
    const { deleteSelectedTasks, isPending: isBulkDeleting } = useDeleteSelectedTasks();
    const { runScheduler, isPending: isRunningScheduler } = useRunScheduler();
    const { completeTask } = useCompleteTask();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState("");

    const handleDeleteTask = (taskId: string) => {
        setDeletingTaskId(taskId);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteTask = async () => {
        await deleteTask(deletingTaskId);
        setShowDeleteConfirm(false);
        setDeletingTaskId("");
    };

    const confirmBulkDeleteTasks = async () => {
        const selectedIds = Object.keys(selected).filter((taskId) => selected[taskId]);
        if (!selectedIds.length) return;

        await deleteSelectedTasks(selectedIds);
        setSelected({});
        setShowBulkDeleteConfirm(false);
    };

    const [searchParams, setSearchParams] = useSearchParams();
    const isAddModalOpen = searchParams.get("modal") === "addTask";
    const editingTaskId = searchParams.get("taskId") || "";
    const isEditModalOpen = searchParams.get("modal") === "editTask";

    const openAddTask = () => setSearchParams({ modal: "addTask" });
    const openEditTask = (taskId: string) =>
        setSearchParams({ modal: "editTask", taskId });
    const closeModals = () => setSearchParams({});

    const navigate = useNavigate();
    const [showFilters, setShowFilters] = useState(true);

    const clearFilters = () =>
        setSearchBy({
            taskIdOrName: "",
            taskType: "",
            status: "",
            requiredMachineType: "",
        });

    return (
        <AnimatedPage>
            <div className="main-page py-6 tasks-page">
                <div className="container">
                    <AnimatedComponent delay={0.1}>
                        <section className="tasks-hero">
                            <div>
                                <h1>Tasks</h1>
                                <p className="tasks-subtitle">
                                    Prioritize work, assign machines, and track manufacturing tasks
                                    through scheduling and completion.
                                </p>
                            </div>

                            <TasksControls
                                onAddTask={openAddTask}
                                onRunScheduler={runScheduler}
                                isRunningScheduler={isRunningScheduler}
                            />
                        </section>
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.2}>
                        <TasksFiltersSection
                            searchBy={searchBy}
                            setSearchBy={setSearchBy}
                            showFilters={showFilters}
                            onToggleFilters={() => setShowFilters((prev) => !prev)}
                            clearFilters={clearFilters}
                        />
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.3}>
                        <main className="white-bg p-4 rounded-lg shadow-md tasks-table-panel">
                            <BulkActionsBar
                                selectedCount={selectedCount}
                                onDeleteSelected={() => setShowBulkDeleteConfirm(true)}
                            />

                            <TasksTable
                                tasks={tasks}
                                selected={selected}
                                selectedCount={selectedCount}
                                allSelected={allSelected}
                                onToggleAll={toggleAll}
                                onToggleOne={toggleOne}
                                onViewTask={(task) =>
                                    navigate(`/tasks/${task.task_id}`, {
                                        state: { task },
                                    })
                                }
                                onEditTask={openEditTask}
                                onDeleteTask={handleDeleteTask}
                                onCompleteTask={completeTask}
                                isLoading={isLoading}
                                error={error ?? null}
                            />

                            <Pagination
                                paginationInfo={paginationInfo}
                                onPageChange={setPaginationInfo}
                            />
                        </main>
                    </AnimatedComponent>
                </div>
            </div>

            {isAddModalOpen && <AddTaskModal isOpen onClose={closeModals} />}

            {isEditModalOpen && (
                <EditTaskModal
                    isOpen
                    taskId={editingTaskId}
                    task={tasks.find((item) => item.task_id === editingTaskId)}
                    onClose={closeModals}
                />
            )}

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Task"
                message={`Delete task ${deletingTaskId}?`}
                confirmButtonText="Delete"
                isLoading={isDeletingTask}
            />

            <DeleteConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDeleteTasks}
                title="Delete Selected Tasks"
                message={`Delete ${selectedCount} selected tasks?`}
                confirmButtonText="Delete Selected"
                isLoading={isBulkDeleting}
            />
        </AnimatedPage>
    );
};

export default TasksPage;
