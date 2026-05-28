import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError } from "@/lib/types/apiType";

export const commentApi = {
    all: (targetId: string, targetType: "Video" | "Tweet") => {
        return serverFetch<ApiSuccess<any[]> | ApiError>(`/${targetType}/getallcomments/${targetId}`);
    },
};