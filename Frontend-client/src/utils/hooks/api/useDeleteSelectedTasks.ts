import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useDeleteSelectedTasks = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async (taskIds: string[]) => {
            const response = await axiosInstance.delete("/api/tasks/bulk-delete", {
                data: { taskIds },
            });
            return response.data;
        },
        onSuccess: () => {
            notify("success", "Selected tasks deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message ||
                    error.message ||
                    "Failed to delete selected tasks"
            );
        },
    });

    return {
        deleteSelectedTasks: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useDeleteSelectedTasks;
