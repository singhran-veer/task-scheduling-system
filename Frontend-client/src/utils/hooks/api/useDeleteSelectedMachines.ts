import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useDeleteSelectedMachines = () => {

    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({

        mutationFn: (machineIds: string[]) =>

            axiosInstance.delete("/api/machines/bulk-delete", {

                data: { machineIds }

            }),

        onSuccess: () => {

            notify("success", "Selected machines deleted successfully");

            queryClient.invalidateQueries({

                queryKey: ["machines"]

            });

            queryClient.invalidateQueries({

                queryKey: ["dashboard"]

            });

            queryClient.invalidateQueries({

                queryKey: ["activity"]

            });

        },

        onError: (error: any) => {

            const errorMessage =

                error.response?.data?.message ||
                error.message ||
                "Failed to delete machines";

            notify("error", errorMessage);

        },

    });

    return {

        deleteSelectedMachines: mutateAsync,

        isPending,

        error,

        data,

    };

};

export default useDeleteSelectedMachines;
