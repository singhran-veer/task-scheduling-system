import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";
import type { MachineForm } from "../../../common/Types/Interfaces";

interface UpdateMachineResponse {
    message: string;
    machine_id: string;
    data?: any;
}

const useUpdateMachine = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation<
        UpdateMachineResponse,
        Error,
        {
            machineId: string;
            machineData: Partial<MachineForm>;
            showNotification?: boolean;
        }
    >({
        mutationFn: ({ machineId, machineData }) =>
            axiosInstance.put(`/api/machines/${machineId}`, machineData),

        onSuccess: (_, variables) => {
            if (variables.showNotification !== false) {
                notify("success", "Machine updated successfully");
            }

            // Refresh machines list
            queryClient.invalidateQueries({ queryKey: ["machines"] });

            // Refresh dashboard
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            // Refresh analytics
            queryClient.invalidateQueries({
                queryKey: ["machine-utilization"],
            });

            queryClient.invalidateQueries({
                queryKey: ["system-efficiency"],
            });

            // Refresh activity
            queryClient.invalidateQueries({
                queryKey: ["activity"],
            });

            // Refresh specific machine details
            queryClient.invalidateQueries({
                queryKey: ["machine-details", variables.machineId],
            });
        },

        onError: (error: any) => {
            console.error("Error updating machine:", error.message);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update machine";

            notify("error", errorMessage);
        },
    });

    return {
        updateMachine: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useUpdateMachine;
