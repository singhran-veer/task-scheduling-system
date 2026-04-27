import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import AnimatedComponent from "../../common/Animations/AnimatedComponent/AnimatedComponent";
import AnimatedPage from "../../common/Animations/AnimatedPage/AnimatedPage";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import Pagination from "../../components/Pagination/Pagination";
import type { PaginationInfo } from "../../common/Types/Interfaces";
import useGetActivityTimeline, {
    type ActivityTimelineItem,
} from "../../utils/hooks/api/useGetActivityTimeline";
import "./ActivityPage.scss";

const PAGE_SIZE = 10;

const formatActionLabel = (action: string) =>
    action
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const formatDateTime = (value: string) => {
    const date = new Date(value);

    return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
    };
};

const getRelatedLabel = (item: ActivityTimelineItem) => {
    if (item.related_machine_id && item.related_task_id) {
        return `${item.related_machine_id} / ${item.related_task_id}`;
    }

    return item.related_machine_id || item.related_task_id || "N/A";
};

const ActivityPage = () => {
    const { data, isLoading, isFetching, error, refetch } =
        useGetActivityTimeline();

    const [showFilters, setShowFilters] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [entityType, setEntityType] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const activityItems = data?.data || [];

    const actionOptions = useMemo(
        () =>
            Array.from(
                new Set(activityItems.map((item) => item.action).filter(Boolean))
            ).sort(),
        [activityItems]
    );

    const filteredActivities = useMemo(() => {
        return activityItems.filter((item) => {
            const haystack = [
                item._id,
                item.entity_id,
                item.related_machine_id,
                item.related_task_id,
                item.action,
                item.entity_type,
                JSON.stringify(item.details || {}),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = !searchTerm.trim()
                ? true
                : haystack.includes(searchTerm.trim().toLowerCase());

            const matchesType = !entityType ? true : item.entity_type === entityType;
            const matchesAction = !actionFilter ? true : item.action === actionFilter;

            const activityDate = new Date(item.action_time);
            const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
            const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

            const matchesFrom = fromDate ? activityDate >= fromDate : true;
            const matchesTo = toDate ? activityDate <= toDate : true;

            return (
                matchesSearch &&
                matchesType &&
                matchesAction &&
                matchesFrom &&
                matchesTo
            );
        });
    }, [activityItems, searchTerm, entityType, actionFilter, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
    const safeCurrentPage = Math.min(currentPage, totalPages);

    useEffect(() => {
        if (currentPage !== safeCurrentPage) {
            setCurrentPage(safeCurrentPage);
        }
    }, [currentPage, safeCurrentPage]);

    const paginatedActivities = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
        return filteredActivities.slice(startIndex, startIndex + PAGE_SIZE);
    }, [filteredActivities, safeCurrentPage]);

    const paginationInfo: PaginationInfo = {
        pageNumber: safeCurrentPage,
        totalPages,
        totalDocs: filteredActivities.length,
        hasNextPage: safeCurrentPage < totalPages,
        hasPreviousPage: safeCurrentPage > 1,
    };

    const handlePageChange: Dispatch<SetStateAction<PaginationInfo>> = (value) => {
        const nextValue =
            typeof value === "function" ? value(paginationInfo) : value;

        setCurrentPage(nextValue.pageNumber);
    };

    const resetToFirstPage = () => setCurrentPage(1);

    const clearFilters = () => {
        setSearchTerm("");
        setEntityType("");
        setActionFilter("");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    return (
        <AnimatedPage>
            <div className="activity-page main-page py-6">
                <div className="container">
                    <AnimatedComponent delay={0.08}>
                        <section className="activity-hero">
                            <div>
                                <h1>Activity Feeds</h1>
                                <p>
                                    View and track machine, task, and scheduler
                                    activity history.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="activity-refresh-btn"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                <i className="fa-solid fa-rotate-right"></i>
                                {isFetching ? "Refreshing..." : "Refresh"}
                            </button>
                        </section>
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.14}>
                        <div className="activity-section-toggle">
                            <button
                                type="button"
                                className="activity-toggle-btn"
                                onClick={() => setShowFilters((prev) => !prev)}
                            >
                                <span>Filters & Actions</span>
                                <i
                                    className={`fa-solid fa-chevron-${
                                        showFilters ? "up" : "down"
                                    }`}
                                ></i>
                            </button>
                        </div>
                    </AnimatedComponent>

                    <AnimatedComponent delay={0.2}>
                        <section className="activity-panel white-bg shadow-md">
                            {showFilters && (
                                <div className="activity-filters">
                                    <label className="activity-field activity-field-full">
                                        <span>Search</span>
                                        <input
                                            type="text"
                                            placeholder="Search by activity ID, task ID, machine ID, or action..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                resetToFirstPage();
                                            }}
                                        />
                                    </label>

                                    <div className="activity-filters-grid">
                                        <label className="activity-field">
                                            <span>Entity Type</span>
                                            <select
                                                value={entityType}
                                                onChange={(e) => {
                                                    setEntityType(e.target.value);
                                                    resetToFirstPage();
                                                }}
                                            >
                                                <option value="">All Types</option>
                                                <option value="task">Task</option>
                                                <option value="machine">Machine</option>
                                                <option value="system">System</option>
                                            </select>
                                        </label>

                                        <label className="activity-field">
                                            <span>Action</span>
                                            <select
                                                value={actionFilter}
                                                onChange={(e) => {
                                                    setActionFilter(e.target.value);
                                                    resetToFirstPage();
                                                }}
                                            >
                                                <option value="">All Actions</option>
                                                {actionOptions.map((action) => (
                                                    <option key={action} value={action}>
                                                        {formatActionLabel(action)}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>

                                        <label className="activity-field">
                                            <span>From Date</span>
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => {
                                                    setDateFrom(e.target.value);
                                                    resetToFirstPage();
                                                }}
                                            />
                                        </label>

                                        <label className="activity-field">
                                            <span>To Date</span>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => {
                                                    setDateTo(e.target.value);
                                                    resetToFirstPage();
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="activity-clear-row">
                                        <button
                                            type="button"
                                            className="activity-clear-btn"
                                            onClick={clearFilters}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isLoading ? (
                                <LoadingSpinner message="Loading activity feed..." />
                            ) : error ? (
                                <ErrorMessage message={error} />
                            ) : (
                                <>
                                    <div className="activity-table-shell">
                                        <table className="activity-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Entity ID</th>
                                                    <th>Type</th>
                                                    <th>Action</th>
                                                    <th>Related</th>
                                                    <th>Action Time</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedActivities.length ? (
                                                    paginatedActivities.map((item, index) => {
                                                        const timestamp = formatDateTime(
                                                            item.action_time
                                                        );

                                                        return (
                                                            <tr
                                                                key={`${
                                                                    item._id ||
                                                                    item.entity_id
                                                                }-${index}`}
                                                            >
                                                                <td>
                                                                    <span className="activity-id">
                                                                        {item._id
                                                                            ? item._id.slice(-8)
                                                                            : "N/A"}
                                                                    </span>
                                                                </td>
                                                                <td>{item.entity_id}</td>
                                                                <td>
                                                                    <span className="activity-entity-pill">
                                                                        {item.entity_type}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`activity-action-pill ${item.entity_type}`}
                                                                    >
                                                                        {formatActionLabel(
                                                                            item.action
                                                                        )}
                                                                    </span>
                                                                </td>
                                                                <td>{getRelatedLabel(item)}</td>
                                                                <td>
                                                                    {timestamp.date},{" "}
                                                                    {timestamp.time}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan={6} className="activity-empty">
                                                            No activity found for the selected filters.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <Pagination
                                        paginationInfo={paginationInfo}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            )}
                        </section>
                    </AnimatedComponent>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default ActivityPage;
