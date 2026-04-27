import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

interface MachineForm {
    machine_name: string;
    machine_type: string;
    capabilities: string[];
    location?: string;
    max_operating_hours_per_day: number;
}

interface AddMachineResponse {
    message: string;
    machine: {
        machine_id: string;
        machine_name: string;
        machine_type: string;
        status: string;
    };
}

const useAddNewMachine = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation<
        AddMachineResponse,
        Error,
        MachineForm
    >({
        mutationFn: (machineData: MachineForm) =>
            axiosInstance.post("/api/machines", machineData),

        onSuccess: (response) => {
            notify(
                "success",
                `Machine ${response.machine.machine_id} added successfully`
            );

            // Refresh machine list
            queryClient.invalidateQueries({ queryKey: ["machines"] });

            // Refresh dashboard / analytics if needed
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            queryClient.invalidateQueries({ queryKey: ["analytics"] });
        },

        onError: (error: any) => {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to create machine";

            notify("error", errorMessage);
        },
    });

    return {
        addMachine: mutateAsync,
        isPending,
        error,
        data,
    };
};

export default useAddNewMachine;
