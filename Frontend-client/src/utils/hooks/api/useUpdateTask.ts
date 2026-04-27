import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";
import type { TaskForm } from "../../../common/Types/Interfaces";

const useUpdateTask = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async ({
            taskId,
            taskData,
        }: {
            taskId: string;
            taskData: Partial<TaskForm>;
        }) => {
            const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
            return response.data;
        },
        onSuccess: (_, variables) => {
            notify("success", "Task updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({
                queryKey: ["task-details", variables.taskId],
            });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message || error.message || "Failed to update task"
            );
        },
    });

    return {
        updateTask: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useUpdateTask;
