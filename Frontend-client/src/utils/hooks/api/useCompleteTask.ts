import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useCompleteTask = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await axiosInstance.post(`/api/tasks/${taskId}/complete`);
            return response.data;
        },
        onSuccess: (_, taskId) => {
            notify("success", `Task ${taskId} marked as completed`);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["machines"] });
            queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message || error.message || "Failed to complete task"
            );
        },
    });

    return {
        completeTask: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useCompleteTask;
