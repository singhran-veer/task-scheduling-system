import { useState } from "react";
import AnimatedModal from "../../common/Animations/AnimatedModal/AnimatedModal";
import { notify } from "../../utils/functions/notify";
import useAddNewMachine from "../../utils/hooks/api/useAddNewMachine";
import type { MachineForm } from "../../common/Types/Interfaces";
import "./MachineModalForm.scss";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const AddMachineModal = ({ isOpen, onClose }: Props) => {
    const { addMachine, isPending } = useAddNewMachine();

    const [formData, setFormData] = useState<MachineForm>({
        machine_name: "",
        machine_type: "",
        capabilities: [],
        location: "",
        status: "idle",
        max_operating_hours_per_day: 24,
        installation_date: "",
        last_maintenance_date: "",
        notes: "",
    });

    const [capabilityInput, setCapabilityInput] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "max_operating_hours_per_day"
                    ? Number(value)
                    : value,
        }));
    };

    const addCapability = () => {
        if (!capabilityInput.trim()) return;

        setFormData((prev) => ({
            ...prev,
            capabilities: [...prev.capabilities, capabilityInput.trim()],
        }));

        setCapabilityInput("");
    };

    const removeCapability = (cap: string) => {
        setFormData((prev) => ({
            ...prev,
            capabilities: prev.capabilities.filter((c) => c !== cap),
        }));
    };

    const handleSubmit = async () => {
        if (!formData.machine_name || !formData.machine_type) {
            notify("error", "Machine name and type are required");
            return;
        }

        try {
            await addMachine(formData);
            onClose();
        } catch {
            // Hook handles notification
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatedModal
            isOpen={isOpen}
            title="Add New Machine"
            onClose={onClose}
            className="machine-edit-modal"
        >
            <div className="machine-edit-note">
                Configure machine identity, operating constraints, and supported capabilities.
            </div>

            <div className="machine-form-grid">
                <label className="machine-field">
                    <span>Machine Name</span>
                    <input
                        name="machine_name"
                        value={formData.machine_name}
                        onChange={handleChange}
                    />
                </label>

                <label className="machine-field">
                    <span>Machine Type</span>
                    <input
                        name="machine_type"
                        value={formData.machine_type}
                        onChange={handleChange}
                    />
                </label>

                <label className="machine-field">
                    <span>Location</span>
                    <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </label>

                <label className="machine-field">
                    <span>Max Operating Hours / Day</span>
                    <input
                        type="number"
                        name="max_operating_hours_per_day"
                        value={formData.max_operating_hours_per_day}
                        onChange={handleChange}
                    />
                </label>

                <label className="machine-field">
                    <span>Installation Date</span>
                    <input
                        type="date"
                        name="installation_date"
                        value={formData.installation_date}
                        onChange={handleChange}
                    />
                </label>

                <label className="machine-field">
                    <span>Last Maintenance Date</span>
                    <input
                        type="date"
                        name="last_maintenance_date"
                        value={formData.last_maintenance_date}
                        onChange={handleChange}
                    />
                </label>
            </div>

            <div className="machine-capabilities-section">
                <div className="machine-capabilities-header">
                    <h4>Capabilities</h4>
                    <p>Add all manufacturing capabilities this machine supports.</p>
                </div>

                <div className="machine-capabilities-input">
                    <input
                        placeholder="Add capability"
                        value={capabilityInput}
                        onChange={(e) => setCapabilityInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCapability()}
                    />

                    <button
                        type="button"
                        className="main-btn blue-bg px-4"
                        onClick={addCapability}
                    >
                        Add
                    </button>
                </div>

                <div className="machine-capability-chips">
                    {formData.capabilities.map((cap) => (
                        <button
                            key={cap}
                            type="button"
                            className="machine-chip"
                            onClick={() => removeCapability(cap)}
                        >
                            {cap}
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    ))}
                </div>
            </div>

            <label className="machine-field machine-field-full">
                <span>Notes</span>
                <textarea
                    name="notes"
                    placeholder="Add operational or maintenance notes..."
                    value={formData.notes}
                    onChange={handleChange}
                />
            </label>

            <div className="machine-form-actions">
                <button className="main-btn button-black-bg" type="button" onClick={onClose}>
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="green-bg text-white py-2 px-4 rounded"
                    type="button"
                >
                    {isPending ? "Adding..." : "Add Machine"}
                </button>
            </div>
        </AnimatedModal>
    );
};

export default AddMachineModal;
