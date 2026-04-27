import { useState } from "react";
import AnimatedModal from "../../common/Animations/AnimatedModal/AnimatedModal";
import { notify } from "../../utils/functions/notify";
import useAddNewTask from "../../utils/hooks/api/useAddNewTask";
import type { TaskForm } from "../../common/Types/Interfaces";
import "./TaskModalForm.scss";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormState: TaskForm = {
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

const AddTaskModal = ({ isOpen, onClose }: Props) => {
    const { addTask, isPending } = useAddNewTask();
    const [formData, setFormData] = useState<TaskForm>(initialFormState);
    const [capabilityInput, setCapabilityInput] = useState("");

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
        if (
            !formData.task_name.trim() ||
            !formData.task_type.trim() ||
            !formData.required_machine_type.trim()
        ) {
            notify("error", "Task name, task type, and required machine type are required");
            return;
        }

        try {
            await addTask(formData);
            setFormData(initialFormState);
            setCapabilityInput("");
            onClose();
        } catch {
            // Notification handled in hook
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatedModal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Task"
            className="task-edit-modal"
        >
            <div className="task-edit-note">
                Create a new manufacturing task with its constraints, timing, and capability requirements.
            </div>

            <div className="task-form-grid">
                <label className="task-field">
                    <span>Task Name</span>
                    <input
                        name="task_name"
                        value={formData.task_name}
                        onChange={handleChange}
                    />
                </label>

                <label className="task-field">
                    <span>Task Type</span>
                    <input
                        name="task_type"
                        value={formData.task_type}
                        onChange={handleChange}
                    />
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
                        name="cost"
                        min="0"
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
                    {isPending ? "Adding..." : "Add Task"}
                </button>
            </div>
        </AnimatedModal>
    );
};

export default AddTaskModal;
