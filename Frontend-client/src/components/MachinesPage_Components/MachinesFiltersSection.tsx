import type { Dispatch, SetStateAction } from "react";

interface MachineSearchBy {
    machineIdOrName: string;
    status: string;
    machineType: string;
}

interface Props {
    searchBy: MachineSearchBy;
    setSearchBy: Dispatch<SetStateAction<MachineSearchBy>>;
    showFilters: boolean;
    onToggleFilters: () => void;
    clearFilters: () => void;
}

const MachinesFiltersSection = ({
    searchBy,
    setSearchBy,
    showFilters,
    onToggleFilters,
    clearFilters,
}: Props) => {
    return (
        <section className="machines-filters-wrapper">
            <div className="machines-section-toggle">
                <button
                    type="button"
                    className="machines-toggle-btn"
                    onClick={onToggleFilters}
                >
                    <span>Filters & Actions</span>
                    <i
                        className={`fa-solid fa-chevron-${showFilters ? "up" : "down"}`}
                    ></i>
                </button>
            </div>

            {showFilters && (
                <div className="machines-filters-card white-bg shadow-md">
                    <label className="machines-filter-field machines-filter-field-full">
                        <span>Search</span>
                        <input
                            type="text"
                            placeholder="Search by machine ID, name, or location..."
                            value={searchBy.machineIdOrName}
                            onChange={(e) =>
                                setSearchBy((prev) => ({
                                    ...prev,
                                    machineIdOrName: e.target.value,
                                }))
                            }
                        />
                    </label>

                    <div className="machines-filters-grid">
                        <label className="machines-filter-field">
                            <span>Status</span>
                            <select
                                value={searchBy.status}
                                onChange={(e) =>
                                    setSearchBy((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                <option value="">All Status</option>
                                <option value="idle">Idle</option>
                                <option value="busy">Busy</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </label>

                        <label className="machines-filter-field">
                            <span>Machine Type</span>
                            <input
                                type="text"
                                placeholder="CNC, press, furnace..."
                                value={searchBy.machineType}
                                onChange={(e) =>
                                    setSearchBy((prev) => ({
                                        ...prev,
                                        machineType: e.target.value,
                                    }))
                                }
                            />
                        </label>
                        <div className="machines-filter-spacer"></div>
                    </div>

                    <div className="machines-clear-row">
                        <button
                            type="button"
                            className="machines-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default MachinesFiltersSection;
