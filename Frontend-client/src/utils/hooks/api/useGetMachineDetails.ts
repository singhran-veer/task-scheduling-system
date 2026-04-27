import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";

const useGetMachineDetails = (machineId: string) => {
    const fetchMachineDetails = async () => {
        const res = await axiosInstance.get(
            `/api/machines/${machineId}`
        );
        return res.data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["machine-details", machineId],
        queryFn: fetchMachineDetails,
        enabled: !!machineId,
    });

    return {
        data,
        isLoading,
        error: error instanceof Error ? error.message : null,
    };
};

export default useGetMachineDetails;
