import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import type { TaskRow } from "../../../common/Types/Interfaces";

const useGetTaskDetails = (taskId: string) => {
    const fetchTaskDetails = async (): Promise<TaskRow> => {
        const response = await axiosInstance.get(`/api/tasks/${taskId}`);
        return response.data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["task-details", taskId],
        queryFn: fetchTaskDetails,
        enabled: !!taskId,
        retry: false,
    });

    return {
        data,
        isLoading,
        error: error instanceof Error ? error.message : null,
    };
};

export default useGetTaskDetails;
