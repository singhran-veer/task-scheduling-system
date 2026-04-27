import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useRunScheduler = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({
        mutationFn: async () => {
            const response = await axiosInstance.post("/api/scheduler/run");
            return response.data;
        },
        onSuccess: (response: any) => {
            notify(
                "success",
                response?.tasks_assigned
                    ? `Scheduler assigned ${response.tasks_assigned} task(s)`
                    : "Scheduler executed successfully"
            );

            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["machines"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
        onError: (error: any) => {
            notify(
                "error",
                error.response?.data?.message || error.message || "Failed to run scheduler"
            );
        },
    });

    return {
        runScheduler: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useRunScheduler;
