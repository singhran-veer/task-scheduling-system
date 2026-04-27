import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";
import type { TaskForm } from "../../../common/Types/Interfaces";

const useAddNewTask = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async (taskData: TaskForm) => {
            const response = await axiosInstance.post("/api/tasks", taskData);
            return response.data;
        },
        onSuccess: () => {
            notify("success", "Task added successfully");
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message || error.message || "Failed to add task"
            );
        },
    });

    return {
        addTask: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useAddNewTask;
