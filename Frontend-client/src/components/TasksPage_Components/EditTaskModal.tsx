import { useEffect, useState } from "react";
import AnimatedModal from "../../common/Animations/AnimatedModal/AnimatedModal";
import type { TaskForm, TaskRow } from "../../common/Types/Interfaces";
import useGetTaskDetails from "../../utils/hooks/api/useGetTaskDetails";
import useUpdateTask from "../../utils/hooks/api/useUpdateTask";
import "./TaskModalForm.scss";

interface Props {
    isOpen: boolean;
    taskId: string;
    task?: TaskRow;
    onClose: () => void;
}

const emptyForm: TaskForm = {
    task_name: "",
    task_type: "",
    required_machine_type: "",
    required_capabilities: [],
    priority: 1,
    duration: 60,
    time_unit: "minutes",
    deadline: "",
    cost: undefined,
    currency: "INR",
    notes: "",
};

const EditTaskModal = ({ isOpen, taskId, task, onClose }: Props) => {
    const { data } = useGetTaskDetails(taskId);
    const { updateTask, isPending } = useUpdateTask();

    const [formData, setFormData] = useState<TaskForm>(emptyForm);
    const [capabilityInput, setCapabilityInput] = useState("");

    useEffect(() => {
        if (!task) return;

        setFormData((prev) => ({
            ...prev,
            task_name: task.task_name || prev.task_name,
            task_type: task.task_type || prev.task_type,
            required_machine_type:
                task.required_machine_type || prev.required_machine_type,
            required_capabilities:
                task.required_capabilities || prev.required_capabilities,
            priority: task.priority || prev.priority,
            duration: task.duration || prev.duration,
            time_unit: task.time_unit || prev.time_unit,
            deadline: task.deadline ? task.deadline.slice(0, 16) : prev.deadline,
            cost: task.cost ?? prev.cost,
            currency: task.currency || prev.currency,
            notes: task.notes || prev.notes,
        }));
    }, [task]);

    useEffect(() => {
        if (!data) return;

        setFormData({
            task_name: data.task_name || "",
            task_type: data.task_type || "",
            required_machine_type: data.required_machine_type || "",
            required_capabilities: data.required_capabilities || [],
            priority: data.priority || 1,
            duration: data.duration || 0,
            time_unit: data.time_unit || "minutes",
            deadline: data.deadline ? data.deadline.slice(0, 16) : "",
            cost: data.cost ?? undefined,
            currency: data.currency || "INR",
            notes: data.notes || "",
        });
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "priority" || name === "duration" || name === "cost"
                    ? value === ""
                        ? undefined
                        : Number(value)
                    : value,
        }));
    };

    const addCapability = () => {
        const nextCapability = capabilityInput.trim();

        if (!nextCapability || formData.required_capabilities.includes(nextCapability)) {
            return;
        }

        setFormData((prev) => ({
            ...prev,
            required_capabilities: [...prev.required_capabilities, nextCapability],
        }));
        setCapabilityInput("");
    };

    const removeCapability = (capability: string) => {
        setFormData((prev) => ({
            ...prev,
            required_capabilities: prev.required_capabilities.filter(
                (item) => item !== capability
            ),
        }));
    };

    const handleSubmit = async () => {
        await updateTask({
            taskId,
            taskData: formData,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Task"
            className="task-edit-modal"
        >
            <div className="task-edit-note">
                Update task requirements, scheduling constraints, and commercial details.
            </div>

            <div className="task-form-grid">
                <label className="task-field">
                    <span>Task Name</span>
                    <input name="task_name" value={formData.task_name} onChange={handleChange} />
                </label>

                <label className="task-field">
                    <span>Task Type</span>
                    <input name="task_type" value={formData.task_type} onChange={handleChange} />
                </label>

                <label className="task-field">
                    <span>Required Machine Type</span>
                    <input
                        name="required_machine_type"
                        value={formData.required_machine_type}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Priority</span>
                    <input
                        type="number"
                        min="1"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Duration</span>
                    <input
                        type="number"
                        min="1"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Time Unit</span>
                    <select name="time_unit" value={formData.time_unit} onChange={handleChange}>
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                    </select>
                </label>

                <label className="task-field">
                    <span>Deadline</span>
                    <input
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline || ""}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Cost</span>
                    <input
                        type="number"
                        min="0"
                        name="cost"
                        value={formData.cost ?? ""}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Currency</span>
                    <input
                        name="currency"
                        value={formData.currency || ""}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div className="task-capabilities-section">
                <div className="task-capabilities-header">
                    <h4>Required Capabilities</h4>
                    <p>Add all capabilities the assigned machine must support.</p>
                </div>

                <div className="task-capabilities-input">
                    <input
                        className="flex-1"
                        placeholder="Add required capability"
                        value={capabilityInput}
                        onChange={(e) => setCapabilityInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addCapability();
                            }
                        }}
                    />
                    <button type="button" className="main-btn blue-bg px-4" onClick={addCapability}>
                        Add
                    </button>
                </div>

                <div className="task-capability-chips">
                    {formData.required_capabilities.map((capability) => (
                        <button
                            key={capability}
                            type="button"
                            className="task-chip"
                            onClick={() => removeCapability(capability)}
                        >
                            {capability}
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    ))}
                </div>
            </div>

            <label className="task-field task-field-full">
                <span>Notes</span>
                <textarea
                    className="task-notes-field"
                    rows={5}
                    name="notes"
                    placeholder="Add any important scheduling or production notes..."
                    value={formData.notes || ""}
                    onChange={handleChange}
                />
            </label>

            <div className="task-form-actions">
                <button className="main-btn button-black-bg" type="button" onClick={onClose}>
                    Cancel
                </button>
                <button
                    className="green-bg text-white py-2 px-4 rounded"
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                >
                    {isPending ? "Updating..." : "Save Changes"}
                </button>
            </div>
        </AnimatedModal>
    );
};

export default EditTaskModal;
