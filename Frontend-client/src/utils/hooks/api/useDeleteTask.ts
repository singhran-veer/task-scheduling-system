import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useDeleteTask = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
            return response.data;
        },
        onSuccess: (_, taskId) => {
            notify("success", "Task deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["task-details", taskId] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message || error.message || "Failed to delete task"
            );
        },
    });

    return {
        deleteTask: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useDeleteTask;
