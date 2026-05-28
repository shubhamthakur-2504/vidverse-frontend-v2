import { serverFetch } from "./serverFetch";
import { ApiSuccess, ApiError } from "@/lib/types/apiType";
import { Comment } from "@/lib/types/commentType";

export const commentApi = {
    all: (targetId: string, targetType: "Video" | "Tweet") => {
        const route = targetType === "Video"
            ? `/videos/getallcomments/${targetId}`
            : `/tweets/getallcomment/${targetId}`;

        return serverFetch<ApiSuccess<Comment[]> | ApiError>(route);
    },
};