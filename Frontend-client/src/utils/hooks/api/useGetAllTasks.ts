import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import type { TaskFilters, TaskRow } from "../../../common/Types/Interfaces";

interface UseGetAllTasksProps {
    pageNumber: number;
    limit: number;
    filters?: TaskFilters;
}

interface TasksApiResponse {
    data: TaskRow[];
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

function useGetAllTasks({
    pageNumber,
    limit,
    filters = {},
}: UseGetAllTasksProps) {
    const fetchTasks = async (): Promise<TasksApiResponse> => {
        const queryParams = new URLSearchParams();

        queryParams.append("page", pageNumber.toString());
        queryParams.append("limit", limit.toString());

        if (filters.taskIdOrName?.trim()) {
            queryParams.append(
                "taskIdOrName",
                filters.taskIdOrName.trim()
            );
        }

        if (filters.taskType?.trim()) {
            queryParams.append(
                "taskType",
                filters.taskType.trim()
            );
        }

        if (filters.status?.trim()) {
            queryParams.append(
                "status",
                filters.status.trim()
            );
        }

        if (filters.requiredMachineType?.trim()) {
            queryParams.append(
                "requiredMachineType",
                filters.requiredMachineType.trim()
            );
        }

        const res = await axiosInstance.get(
            `/api/tasks?${queryParams.toString()}`
        );

        return {
            ...res.data,
            data: (res.data.data || []).map((task: TaskRow) => ({
                ...task,
                assignedMachine_id:
                    task.assignedMachine_id || task.assignedMachine?.id || null,
            })),
        };
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["tasks", pageNumber, limit, filters],
        queryFn: fetchTasks,
        staleTime: 10000,
    });

    return {
        data,
        isLoading,
        error: error instanceof Error ? error.message : null,
    };
}

export default useGetAllTasks;
