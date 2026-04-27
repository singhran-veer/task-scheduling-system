import { useParams } from "react-router-dom";
import "./MachineDetailsPage.scss";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import PageHeader from "../../components/Headings/PageHeader/PageHeader";
import useGetMachineDetails from "../../utils/hooks/api/useGetMachineDetails";
import LoadingPageSpinner from "../../components/LoadingPageSpinner/LoadingPageSpinner";
import BackButton from "../../components/BackButton/BackButton";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import EditMachineModal from "../../components/MachinesPage_Components/EditMachineModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import useDeleteMachine from "../../utils/hooks/api/useDeleteMachine";
import { useNavigate } from "react-router-dom";

const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
};

const MachineDetailsPage = () => {
    const { machineId } = useParams<{ machineId: string }>();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { deleteMachine, isPending: isDeletingMachine } = useDeleteMachine();

    const { data, isLoading, error } =
        useGetMachineDetails(machineId || "");

    if (isLoading)
        return (
            <LoadingPageSpinner message="Loading machine details..." />
        );

    if (error)
        return <div className="p-6 text-red-500">{error}</div>;

    if (!data)
        return <div className="p-6">Machine not found</div>;

    return (
        <AnimatedPage>
            <div className="main-page py-6 machine-details-page">
                <div className="container space-y-6">
                    <div className="header-container flex items-center gap-2 justify-between">
                        <PageHeader
                            title="Machine Details"
                            subtitle="View machine capabilities, assignment status, and operating history."
                        />
                        <BackButton />
                    </div>

                    <main className="machine-details-container mt-8">
                        <section className="machine-summary-card white-bg shadow-md">
                            <div className="machine-summary-top">
                                <div>
                                    <h2>
                                        Machine <span>{data.machine_id}</span>
                                    </h2>
                                    <p>{data.machine_name}</p>
                                </div>

                                <span
                                    className={`status-badge ${
                                        data.status === "idle"
                                            ? "status-unassigned"
                                            : data.status === "busy"
                                            ? "status-assigned"
                                            : "status-inProgress"
                                    }`}
                                >
                                    {data.status}
                                </span>
                            </div>

                            <div className="machine-summary-actions">
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
                            </div>
                        </section>

                        <div className="machine-details-grid">
                            <section className="white-bg p-6 rounded-lg shadow-md machine-details-card machine-block-wide">
                                <h3 className="machine-section-title">Machine Information</h3>
                                <div className="machine-info-grid">
                                    <article className="machine-info-tile">
                                        <span>Machine Type</span>
                                        <strong>{data.machine_type}</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Location</span>
                                        <strong>{data.location || "N/A"}</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Efficiency</span>
                                        <strong>{data.efficiency?.toFixed(2)}%</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Total Working Time</span>
                                        <strong>{data.total_working_time} mins</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Total Idle Time</span>
                                        <strong>{data.total_idle_time} mins</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Total Maintenance Time</span>
                                        <strong>{data.total_maintenance_time ?? 0} mins</strong>
                                    </article>
                                    <article className="machine-info-tile">
                                        <span>Breakdown Count</span>
                                        <strong>{data.breakdown_count ?? 0}</strong>
                                    </article>
                                </div>
                            </section>

                            

                            <section className="white-bg p-6 rounded-lg shadow-md machine-details-card machine-block-wide">
                                <h3 className="machine-section-title">Assignment</h3>
                                <div className="machine-assignment-stack">
                                    <div className="machine-assignment-card">
                                        <div className="machine-assignment-icon">
                                            <i className="fa-solid fa-diagram-project"></i>
                                        </div>
                                        <div>
                                            <span>Current Task</span>
                                            {data.assignedTask_id ? (
                                                <NavLink
                                                    to={`/tasks/${data.assignedTask_id}`}
                                                    className="blue-c font-medium"
                                                >
                                                    Task {data.assignedTask_id}
                                                </NavLink>
                                            ) : (
                                                <strong>No task currently assigned</strong>
                                            )}
                                        </div>
                                    </div>

                                    <div className="machine-assignment-card">
                                        <div className="machine-assignment-icon muted">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                        </div>
                                        <div>
                                            <span>Past Assigned Tasks</span>
                                            <strong>
                                                {data.pastAssignedTasks?.length
                                                    ? data.pastAssignedTasks.length
                                                    : 0} task(s) recorded
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="white-bg p-6 rounded-lg shadow-md machine-details-card">
                                <h3 className="machine-section-title">Maintenance</h3>
                                <div className="machine-activity-list">
                                    {[
                                        {
                                            label: "Installed",
                                            time: data.installation_date,
                                        },
                                        {
                                            label: "Last maintenance",
                                            time: data.last_maintenance_date,
                                        },
                                        {
                                            label: "Status updated",
                                            time: data.last_status_change,
                                        },
                                    ]
                                        .filter((item) => item.time)
                                        .map((item) => (
                                            <article
                                                key={`${item.label}-${item.time}`}
                                                className="machine-activity-card"
                                            >
                                                <div className="machine-activity-meta">
                                                    <span>
                                                        <i className="fa-solid fa-calendar"></i>
                                                        {formatDate(item.time)}
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

            <EditMachineModal
                isOpen={isEditModalOpen}
                machineId={data.machine_id}
                onClose={() => setIsEditModalOpen(false)}
            />

            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={async () => {
                    await deleteMachine(data.machine_id);
                    navigate("/machines");
                }}
                title="Delete Machine"
                message={`Are you sure you want to delete machine ${data.machine_id}?`}
                confirmButtonText="Delete Machine"
                isLoading={isDeletingMachine}
            />
        </AnimatedPage>
    );
};

export default MachineDetailsPage;
