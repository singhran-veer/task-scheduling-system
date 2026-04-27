import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./MachinesPage.scss";
import BulkActionsBar from "../../components/BulkActionsBar/BulkActionsBar";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import Pagination from "../../components/Pagination/Pagination";

import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";

import MachinesControls from "../../components/MachinesPage_Components/MachinesControls";
import MachinesTable from "../../components/MachinesPage_Components/MachinesTable";
import MachinesFiltersSection from "../../components/MachinesPage_Components/MachinesFiltersSection";

import AddMachineModal from "../../components/MachinesPage_Components/AddMachineModal";
import EditMachineModal from "../../components/MachinesPage_Components/EditMachineModal";


import useGetAllMachines from "../../utils/hooks/api/useGetAllMachines";
import useDeleteMachine from "../../utils/hooks/api/useDeleteMachine";
import useDeleteSelectedMachines from "../../utils/hooks/api/useDeleteSelectedMachines";

import type { MachineRow } from "../../common/Types/Interfaces";

interface MachineSearchBy {
    machineIdOrName: string;
    status: string;
    machineType: string;
}

const MachinesPage = () => {
    // ============================
    // PAGINATION
    // ============================

    const [paginationInfo, setPaginationInfo] = useState({
        pageNumber: 1,
        totalPages: 1,
        totalDocs: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    // ============================
    // FILTERS
    // ============================

    const [searchBy, setSearchBy] = useState<MachineSearchBy>({
        machineIdOrName: "",
        status: "",
        machineType: "",
    });

    // Reset to page 1 when filters change
    useEffect(() => {
        setPaginationInfo((prev) => ({
            ...prev,
            pageNumber: 1,
        }));
    }, [searchBy]);

    // ============================
    // FETCH MACHINES
    // ============================

    const {
        data: fetchedMachinesData,
        isLoading,
        error,
    } = useGetAllMachines({
        pageNumber: paginationInfo.pageNumber,
        limit: 10,
        filters: searchBy,
    });

    const [machines, setMachines] = useState<MachineRow[]>([]);

    useEffect(() => {
        if (fetchedMachinesData) {
            setMachines(fetchedMachinesData.data || []);

            setPaginationInfo({
                pageNumber: fetchedMachinesData.currentPage || 1,
                totalPages: fetchedMachinesData.totalPages || 1,
                totalDocs: fetchedMachinesData.totalDocs || 0,
                hasNextPage: fetchedMachinesData.hasNextPage || false,
                hasPreviousPage:
                    fetchedMachinesData.hasPreviousPage || false,
            });
        }
    }, [fetchedMachinesData]);

    // ============================
    // SELECTION
    // ============================

    const [selected, setSelected] = useState<Record<string, boolean>>({});

    // Reset selection when machines change
    useEffect(() => {
        setSelected({});
    }, [machines]);

    const selectedCount = Object.values(selected).filter(Boolean).length;

    const allSelected =
        machines.length > 0 &&
        machines.every((m) => selected[m.machine_id]);

    const toggleAll = () => {
        const next: Record<string, boolean> = {};
        machines.forEach(
            (m) => (next[m.machine_id] = !allSelected)
        );
        setSelected(next);
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // ============================
    // DELETE (Single)
    // ============================

    const {
        deleteMachine,
        isPending: isDeletingMachine,
    } = useDeleteMachine();

    const [showDeleteConfirm, setShowDeleteConfirm] =
        useState(false);

    const [deletingMachineId, setDeletingMachineId] =
        useState("");

    const handleDeleteMachine = (id: string) => {
        setDeletingMachineId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteMachine = async () => {
        await deleteMachine(deletingMachineId);
        setShowDeleteConfirm(false);
        setDeletingMachineId("");
    };

    // ============================
    // DELETE (Bulk)
    // ============================

    const {
        deleteSelectedMachines,
        isPending: isBulkDeleting,
    } = useDeleteSelectedMachines();

    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] =
        useState(false);

    const handleBulkDelete = () => {
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        const selectedIds = Object.keys(selected).filter(
            (id) => selected[id]
        );

        if (!selectedIds.length) return;

        await deleteSelectedMachines(selectedIds);
        setSelected({});
        setShowBulkDeleteConfirm(false);
    };

    // ============================
    // MODALS
    // ============================

    const [searchParams, setSearchParams] =
        useSearchParams();

    const isAddModalOpen =
        searchParams.get("modal") === "addMachine";

    const editingMachineId =
        searchParams.get("machineId") || "";

    const isEditModalOpen =
        searchParams.get("modal") === "editMachine";

    const openAddMachine = () =>
        setSearchParams({ modal: "addMachine" });

    const openEditMachine = (id: string) =>
        setSearchParams({
            modal: "editMachine",
            machineId: id,
        });

    const closeModals = () =>
        setSearchParams({});

    // ============================
    // NAVIGATION
    // ============================

    const navigate = useNavigate();

    // ============================
    // FILTER UI
    // ============================

    const [showFilters, setShowFilters] =
        useState(true);

    const clearFilters = () =>
        setSearchBy({
            machineIdOrName: "",
            status: "",
            machineType: "",
        });

    // ============================
    // UI
    // ============================

    return (
        <AnimatedPage>
            <div className="main-page py-6 machines-page">
                <div className="container">

                    <AnimatedComponent delay={0.1}>
                        <section className="machines-hero">
                            <div>
                                <h1>Machines</h1>
                                <p className="machines-subtitle">
                                    Track machine readiness, capabilities, and availability across
                                    the manufacturing floor.
                                </p>
                            </div>

                            <MachinesControls
                                onAddMachine={openAddMachine}
                            />
                        </section>
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.2}>
                        <MachinesFiltersSection
                            searchBy={searchBy}
                            setSearchBy={setSearchBy}
                            showFilters={showFilters}
                            onToggleFilters={() =>
                                setShowFilters(!showFilters)
                            }
                            clearFilters={clearFilters}
                        />
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.3}>
                        <main className="white-bg p-4 rounded-lg shadow-md machines-table-panel">

                            <BulkActionsBar
                                selectedCount={selectedCount}
                                onDeleteSelected={handleBulkDelete}
                            />

                            <MachinesTable
                                machines={machines}
                                selected={selected}
                                selectedCount={selectedCount}
                                allSelected={allSelected}
                                onToggleAll={toggleAll}
                                onToggleOne={toggleOne}
                                onViewMachine={(id: string) =>
                                    navigate(`/machines/${id}`)
                                }
                                onEditMachine={openEditMachine}
                                onDeleteMachine={handleDeleteMachine}
                                isLoading={isLoading}
                                error={error ?? null}
                            />


                            <Pagination
                                paginationInfo={paginationInfo}
                                onPageChange={
                                    setPaginationInfo
                                }
                            />
                        </main>
                    </AnimatedComponent>
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <AddMachineModal
                    isOpen
                    onClose={closeModals}
                />
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditMachineModal
                    isOpen
                    machineId={editingMachineId}
                    onClose={closeModals}
                />
            )}

            {/* Single Delete Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() =>
                    setShowDeleteConfirm(false)
                }
                onConfirm={confirmDeleteMachine}
                title="Delete Machine"
                message={`Delete machine ${deletingMachineId}?`}
                confirmButtonText="Delete"
                isLoading={isDeletingMachine}
            />

            {/* Bulk Delete Modal */}
            <DeleteConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() =>
                    setShowBulkDeleteConfirm(false)
                }
                onConfirm={confirmBulkDelete}
                title="Delete Selected Machines"
                message={`Delete ${selectedCount} selected machines?`}
                confirmButtonText="Delete Selected"
                isLoading={isBulkDeleting}
            />
        </AnimatedPage>
    );
};

export default MachinesPage;
