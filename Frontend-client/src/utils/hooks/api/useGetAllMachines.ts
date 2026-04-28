import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";
import type { MachineFilters, MachineRow } from "../../../common/Types/Interfaces";

interface UseGetAllMachinesProps {

    pageNumber: number;
    limit: number;
    filters?: MachineFilters;

}

interface MachinesApiResponse {
    data: MachineRow[];
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}


function useGetAllMachines({

    pageNumber,
    limit,
    filters = {}

}: UseGetAllMachinesProps) {


    const fetchMachines = async (): Promise<MachinesApiResponse> => {

        try {

            const queryParams = new URLSearchParams();

            queryParams.append("page", pageNumber.toString());

            queryParams.append("limit", limit.toString());


            if (filters.machineIdOrName?.trim()) {

                queryParams.append(
                    "machineIdOrName",
                    filters.machineIdOrName.trim()
                );

            }


            if (filters.machineType?.trim()) {

                queryParams.append(
                    "machineType",
                    filters.machineType.trim()
                );

            }


            if (filters.status?.trim()) {

                queryParams.append(
                    "status",
                    filters.status.trim()
                );

            }


            const res = await axiosInstance.get(

                `/api/machines?${queryParams.toString()}`

            );


            return res.data as MachinesApiResponse;

        }

        catch (error: any) {

            throw new Error(
                "Error fetching machines: " + error.message
            );

        }

    };


    const { data, isLoading, error } = useQuery({

        queryKey: ["machines", pageNumber, limit, filters],

        queryFn: fetchMachines,

        staleTime: 10000,

    });


    return {

        data,
        isLoading,
        error: error?.message ?? null

    };

}

export default useGetAllMachines;
