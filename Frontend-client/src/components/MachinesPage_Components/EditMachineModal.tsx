import { useEffect, useState } from "react";
import AnimatedModal from "../../common/Animations/AnimatedModal/AnimatedModal";
import { notify } from "../../utils/functions/notify";
import useUpdateMachine from "../../utils/hooks/api/useUpdateMachine";
import useGetMachineDetails from "../../utils/hooks/api/useGetMachineDetails";
import type { MachineForm } from "../../common/Types/Interfaces";
import "./MachineModalForm.scss";

interface Props {
    isOpen: boolean;
    machineId: string;
    onClose: () => void;
}

const EditMachineModal = ({ isOpen, machineId, onClose }: Props) => {
    const { updateMachine, isPending } = useUpdateMachine();
    const { data } = useGetMachineDetails(machineId);

    const [formData, setFormData] = useState<MachineForm>({
        machine_name: "",
        machine_type: "",
        capabilities: [],
        location: "",
        status: "idle",
        max_operating_hours_per_day: 8,
        installation_date: "",
        last_maintenance_date: "",
        notes: "",
    });

    const [capabilityInput, setCapabilityInput] = useState("");
    const [originalStatus, setOriginalStatus] = useState<"idle" | "busy" | "maintenance">("idle");

    useEffect(() => {
        if (!data) return;

        setFormData((prev) => {
            if (prev.machine_name !== data.machine_name) {
                setOriginalStatus(data.status || "idle");
                return {
                    ...prev,
                    ...data,
                    installation_date:
                        data.installation_date?.split("T")[0] || "",
                    last_maintenance_date:
                        data.last_maintenance_date?.split("T")[0] || "",
                };
            }

            return prev;
        });
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        try {
            const machineData: Partial<MachineForm> & {
                last_maintenance_date?: string;
                last_status_change?: string;
            } = {
                ...formData,
            };

            if (formData.status && formData.status !== originalStatus) {
                machineData.last_status_change = new Date().toISOString();

                if (formData.status === "maintenance") {
                    machineData.last_maintenance_date = new Date().toISOString();
                }
            }

            await updateMachine({
                machineId,
                machineData,
            });

            notify("success", "Machine updated successfully");
            onClose();
        } catch {
            notify("error", "Update failed");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatedModal
            isOpen={isOpen}
            title="Edit Machine"
            onClose={onClose}
            className="machine-edit-modal"
        >
            <div className="machine-edit-note">
                Update machine identity, operating constraints, and supported capabilities.
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
                    <span>Status</span>
                    <select
                        name="status"
                        value={formData.status || "idle"}
                        onChange={handleChange}
                    >
                        <option value="idle">Idle</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
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
                    {isPending ? "Updating..." : "Save Changes"}
                </button>
            </div>
        </AnimatedModal>
    );
};

export default EditMachineModal;
