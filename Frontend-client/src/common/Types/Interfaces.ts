import type { Dispatch, ReactNode, SetStateAction } from "react";

export interface PaginationInfo {
    pageNumber: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface TableColumn<T> {
    key: string;
    label: ReactNode;
    render?: (row: T) => ReactNode;
    align?: "left" | "center" | "right";
}

export interface BuildColumnsProps<T> {
    columns?: TableColumn<T>[];
    headers?: string[];
    rows: T[];
}

export interface ResponsiveTableProps<T> {
    headers?: string[];
    rows: T[];
    columns?: TableColumn<T>[];
    stickyHeader?: boolean;
    className?: string;
    tableClassName?: string;
    seeDetails?: boolean;
    isLoading?: boolean;
    error?: string | null;
}

export interface DefaultCellProps<T> {
    row: T;
    col: TableColumn<T>;
}

export interface AssignedDriverCellProps {
    cellKey: string;
    driver?: {
        id?: string;
        name?: string;
    } | null;
}

export interface BulkActionsBarProps {
    selectedCount: number;
    onDeleteSelected: () => void;
}

export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    message: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    isLoading?: boolean;
}

export interface PaginationProps {
    paginationInfo: PaginationInfo;
    onPageChange: Dispatch<SetStateAction<PaginationInfo>>;
}

export interface PaginationInfoProps {
    pageNumber: number;
    totalPages: number;
}

export interface PaginationArrowProps {
    direction: "previous" | "next";
    disabled: boolean;
    onClick: () => void;
    title?: string;
}

export interface PaginationButtonProps {
    active?: boolean;
    isActive?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: ReactNode;
    title?: string;
    className?: string;
}

export interface PaginationNumbersProps {
    currentPage?: number;
    pageNumber?: number;
    totalPages: number;
    onPageClick: (page: number) => void;
}

export interface PaginationControlsProps {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageClick: (page: number) => void;
    onPrevious: () => void;
    onNext: () => void;
}

export interface MachineRow extends Record<string, unknown> {
    machine_id: string;
    machine_name: string;
    machine_type: string;
    status: "idle" | "busy" | "maintenance";
    capabilities: string[];
    location?: string;
    total_working_time: number;
    total_idle_time: number;
    total_maintenance_time?: number;
    efficiency: number;
    assignedTask?: {
        id: string;
    } | null;
    created_at?: string;
}

export interface MachineFilters {
    machineIdOrName?: string;
    machineType?: string;
    status?: string;
}

export interface MachineForm {
    machine_name: string;
    machine_type: string;
    capabilities: string[];
    location?: string;
    status?: "idle" | "busy" | "maintenance";
    max_operating_hours_per_day: number;
    installation_date?: string;
    last_maintenance_date?: string;
    notes?: string;
}

export type UpdateMachineForm = Partial<MachineForm>;

export interface TaskAssignedMachine {
    id: string;
    name?: string | null;
    type?: string | null;
    status?: string | null;
}

export interface TaskRow extends Record<string, unknown> {
    task_id: string;
    task_name: string;
    task_type: string;
    required_machine_type: string;
    required_capabilities: string[];
    priority: number;
    duration: number;
    time_unit: string;
    arrival_time: string;
    deadline: string;
    status: "pending" | "scheduled" | "running" | "completed";
    assignedMachine_id?: string | null;
    assignedMachine?: TaskAssignedMachine | null;
    lastMachine_id?: string | null;
    assigned_at?: string;
    completed_at?: string;
    cost?: number | null;
    currency?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface TaskForm {
    task_name: string;
    task_type: string;
    required_machine_type: string;
    required_capabilities: string[];
    priority: number;
    duration: number;
    time_unit: string;
    deadline?: string;
    cost?: number;
    currency?: string;
    notes?: string;
}

export interface TaskFilters {
    taskIdOrName?: string;
    taskType?: string;
    status?: string;
    requiredMachineType?: string;
}

export interface DriverRow extends Record<string, unknown> {
    driver_id: string;
    name: string;
    status: string;
    vehicle_type: string;
    license_type: string;
    phone: string;
    picture?: string;
    assignedRoute?: {
        id: string;
    } | null;
}

export interface SearchBy {
    routeIdOrDriverName: string;
    status: string;
    duration: string;
}

export interface AddRouteItemProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteRow extends Record<string, unknown> {
    route_id: string;
    status?: string;
    assignedDriver?: {
        id?: string;
        name?: string;
    } | null;
    [key: string]: unknown;
}

export interface RoutesTableProps {
    routes: RouteRow[];
    selected: Record<string, boolean>;
    selectedCount: number;
    allSelected: boolean;
    onToggleAll: () => void;
    onToggleOne: (id: string) => void;
    onViewRoute: (id: string) => void;
    onEditRoute: (id: string) => void;
    onDeleteRoute: (id: string) => void;
    isLoading: boolean;
    error: string | null;
}

export interface FiltersSectionProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    searchBy: SearchBy;
    setSearchBy: Dispatch<SetStateAction<SearchBy>>;
    clearFilters: () => void;
}

export interface RoutesControlsProps {
    onExportCsv: () => void;
    onAddRoute: () => void;
    isExportingCsv?: boolean;
}

export interface DriverForm extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverFilters extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverSearchBy {
    driverIdOrName: string;
    status: string;
    licenseType: string;
}

export interface UseGetAllDriversProps {
    pageNumber: number;
    limit: number;
    filters?: DriverFilters;
}

export interface WindowStates {
    [key: string]: boolean;
}

export interface SidebarState {
    activeBar: boolean;
    compressSidebar: boolean;
}

export interface PropTypes {
    children?: ReactNode;
    content: string;
    direction?: "top" | "bottom" | "left" | "right";
    minWidth?: string | number;
    customClass?: string;
}

export interface LogoProps {
    className?: string;
    disabled?: boolean;
    compressSidebar?: boolean;
}

export interface SidebarLinkProps {
    to: string;
    title: string;
    iconClass: string;
    label: string;
    compressSidebar?: boolean;
    onClick?: () => void;
}

export interface UnsavedChangesDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface UseUnsavedChangesOptions {
    hasUnsavedChanges: boolean;
}

export interface SelectOption {
    label: string;
    value: string;
}

export interface ValidationErrors {
    [key: string]: string;
}

export interface ActivityFeedFilters extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedRow extends Record<string, unknown> {
    id?: string;
    [key: string]: unknown;
}

export interface ActivityFeedsTableProps {
    feeds: ActivityFeedRow[];
    isLoading: boolean;
    error: string | null;
}

export interface ActivityFeedsFiltersProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedsContainerProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedsContentProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedsControlsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedsErrorProps {
    error: string | null;
}

export interface ActivityFeedsLayoutProps {
    children?: ReactNode;
}

export interface ActivityFeedsLoadingProps {
    message?: string;
}

export interface ActivityFeedsPaginationProps {
    paginationInfo: PaginationInfo;
    onPageChange: Dispatch<SetStateAction<PaginationInfo>>;
}

export interface UseActivityFeedsSelectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseActivityFeedsSelectionReturn extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseActivityFeedsPageStateProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseActivityFeedsPageStateReturn extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseActivityFeedsActionsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseActivityFeedsActionsReturn extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DeleteSelectedRoutesResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DeleteSelectedDriversResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DeleteDriverResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UpdateRouteResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UpdateDriverResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface AddRouteResponse extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseGetRoutesByMonthProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface UseGetRouteDetailsProps {
    routeId: string;
}

export interface UseGetDriverDetailsProps {
    driverId: string;
}

export interface ContactMapProps extends Record<string, unknown> {
    title?: string;
    src?: string;
    className?: string;
}

export interface ContactInfoProps extends Record<string, unknown> {
    location?: string;
    email?: string;
    whatsapp?: string;
    linkedin?: string;
    facebook?: string;
}

export interface StatsCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteItem extends Record<string, unknown> {
    route_id: string;
    [key: string]: unknown;
}

export interface MonthRoute extends Record<string, unknown> {
    route_id?: string;
    [key: string]: unknown;
}

export interface MonthControlsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DayGridProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DayRoutesModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteAvailability extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface SelectColumnProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActionsColumnProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverStatus extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    to?: string;
    label?: string;
    count?: number;
    countColor?: "blue" | "green" | "purple" | "red" | "yellow" | "gray";
}

export interface DriverDocumentsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ContactInfoCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface VehicleCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface AssignmentCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface PersonalLocationCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface InfoRowProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface PastRoutesTimelineProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface HeaderSummaryProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface NotesCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriversTableProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriversControlsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverFiltersSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface AddDriverModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface EditDriverModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ContactsSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteAssignmentSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface BasicInfoSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface AddressSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ContactChannelsSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface VehicleSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface IdentitySectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface LicenseDocumentSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface LicenseSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface NationalIdDocumentSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface PictureUploadSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DocumentImageDisplayProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface FormFieldProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ImageModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface SelectFieldProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverAssignmentProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverCardProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteActivityProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteHeaderProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteNotesSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DriverSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DatesSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface RouteBasicInfoSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface CustomSelectProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface AddRouteModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface EditRouteModalProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface DistanceDurationSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ModalActionsProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface CostSpeedSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface LocationSectionProps extends Record<string, unknown> {
    [key: string]: unknown;
}

export interface ActivityFeedItemProps extends Record<string, unknown> {
    [key: string]: unknown;
}
