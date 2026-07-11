import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";
import type { TaskForm } from "../../../common/Types/Interfaces";

interface AddTaskResponse {
    message: string;
    task: {
        task_id: string;
        task_name: string;
        task_type: string;
        priority: number;
        duration: number;
        status: string;
        created_at: string;
    };
}

const useAddNewTask = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation<
        AddTaskResponse,
        Error,
        TaskForm
    >({
        mutationFn: async (taskData: TaskForm) => {
            const response = await axiosInstance.post<AddTaskResponse>(
                "/api/tasks",
                taskData
            );
            return response.data;
        },
        onSuccess: (response) => {
            notify(
                "success",
                `Task ${response.task.task_id} added successfully`
            );
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["activity-timeline"] });
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
