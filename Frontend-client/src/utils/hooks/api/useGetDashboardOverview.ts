import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";

interface DashboardOverviewResponse {
    machines: {
        total: number;
        idle: number;
        busy: number;
        maintenance: number;
        utilization_percentage: string;
    };
    tasks: {
        total: number;
        pending: number;
        running: number;
        completed: number;
        overdue: number;
    };
    system: {
        total_working_time: number;
        total_idle_time: number;
        total_maintenance_time: number;
        efficiency_percentage: string;
    };
}

const useGetDashboardOverview = () => {
    const fetchDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
        const response = await axiosInstance.get("/api/dashboard");
        return response.data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardOverview,
        staleTime: 10000,
    });

    return {
        data,
        isLoading,
        error: error instanceof Error ? error.message : null,
    };
};

export default useGetDashboardOverview;
