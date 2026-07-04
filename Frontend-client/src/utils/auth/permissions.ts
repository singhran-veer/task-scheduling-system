import type { AccountType } from "../redux-toolkit/authSlice";

export const canManageResources = (accountType?: AccountType | null) =>
    accountType === "Admin" || accountType === "Manager";

export const canAddDeleteTasks = (accountType?: AccountType | null) =>
    accountType === "Admin" ||
    accountType === "Manager" ||
    accountType === "Operator";

export const canEditTasks = (accountType?: AccountType | null) =>
    accountType === "Admin" ||
    accountType === "Manager" ||
    accountType === "Operator";

export const canOperateScheduler = (accountType?: AccountType | null) =>
    accountType === "Admin" ||
    accountType === "Manager" ||
    accountType === "Operator";

export const roleCapabilities: Record<AccountType, string[]> = {
    Admin: [
        "Create, edit, and delete machines",
        "Create, edit, and delete tasks",
        "Run and reset the scheduler",
        "Complete running tasks",
    ],
    Manager: [
        "Create, edit, and delete machines",
        "Create, edit, and delete tasks",
        "Run and reset the scheduler",
        "Complete running tasks",
    ],
    Operator: [
        "Create, edit, and delete tasks",
        "Run the scheduler",
        "Complete running tasks",
    ],
};
