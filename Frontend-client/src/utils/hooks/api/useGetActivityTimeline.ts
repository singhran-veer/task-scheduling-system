import { useQuery } from "@tanstack/react-query";
import axiosInstance from "./axios-utils";

export interface ActivityTimelineItem {
    _id?: string;
    entity_type: "task" | "machine" | "system";
    entity_id: string;
    action: string;
    related_machine_id?: string;
    related_task_id?: string;
    details?: Record<string, unknown>;
    action_time: string;
}

interface ActivityTimelineResponse {
    total: number;
    data: ActivityTimelineItem[];
}

const useGetActivityTimeline = (limit = 200) => {
    const fetchActivityTimeline = async (): Promise<ActivityTimelineResponse> => {
        const response = await axiosInstance.get(`/api/activity?limit=${limit}`);
        return response.data;
    };

    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ["activity-timeline", limit],
        queryFn: fetchActivityTimeline,
        staleTime: 10000,
    });

    return {
        data,
        isLoading,
        isFetching,
        refetch,
        error: error instanceof Error ? error.message : null,
    };
};

export default useGetActivityTimeline;
