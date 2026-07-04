import AnimatedButton from "../../common/Animations/AnimatedButton/AnimatedButton";

interface TasksControlsProps {
    onAddTask: () => void;
    onRunScheduler: () => void;
    isRunningScheduler?: boolean;
    canAddDelete: boolean;
    canOperate: boolean;
}

const TasksControls = ({
    onAddTask,
    onRunScheduler,
    isRunningScheduler = false,
    canAddDelete,
    canOperate,
}: TasksControlsProps) => {
    return (
        <div className="tasks-header-actions">
            {canAddDelete && (
                <AnimatedButton onClick={onAddTask}>
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Task
                </AnimatedButton>
            )}

            {canOperate && (
                <AnimatedButton
                    variant="success"
                    onClick={onRunScheduler}
                    disabled={isRunningScheduler}
                >
                    <i className="fa-solid fa-gears mr-2"></i>
                    {isRunningScheduler ? "Running..." : "Run Scheduler"}
                </AnimatedButton>
            )}
        </div>
    );
};

export default TasksControls;
