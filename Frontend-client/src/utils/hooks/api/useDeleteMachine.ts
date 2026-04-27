import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import { notify } from "../../functions/notify";

const useDeleteMachine = () => {

    const queryClient = useQueryClient();

    const { mutateAsync, isPending, error, data } = useMutation({

        mutationFn: (machineId: string) =>

            axiosInstance.delete(`/api/machines/${machineId}`),

        onSuccess: (_, machineId) => {

            notify("success", "Machine deleted successfully");

            // refresh machines list
            queryClient.invalidateQueries({

                queryKey: ["machines"]

            });

            // refresh dashboard
            queryClient.invalidateQueries({

                queryKey: ["dashboard"]

            });

            // refresh analytics
            queryClient.invalidateQueries({

                queryKey: ["machine-utilization"]

            });

            queryClient.invalidateQueries({

                queryKey: ["system-efficiency"]

            });

            // refresh activity
            queryClient.invalidateQueries({

                queryKey: ["activity"]

            });

            // refresh specific machine details if exists
            queryClient.invalidateQueries({

                queryKey: ["machine-details", machineId]

            });

        },

        onError: (error: any) => {

            console.error("Error deleting machine:", error.message);

            const errorMessage =

                error.response?.data?.message ||
                error.message ||
                "Failed to delete machine";

            notify("error", errorMessage);

        },

    });


    return {

        deleteMachine: mutateAsync,

        isPending,

        error,

        data,

    };

};

export default useDeleteMachine;
