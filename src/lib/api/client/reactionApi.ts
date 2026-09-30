import apiClient from "./apiClient";

type ReactionTarget = "Video" | "Comment" | "Tweet";
// url segment used by the v2 api for each target
const segment: Record<ReactionTarget, string> = {
  Video: "video",
  Comment: "comment",
  Tweet: "post",
};
const pathFor = (targetId: string, targetType: ReactionTarget) =>
  `/reactions/${segment[targetType]}/${targetId}`;

const reactionApi = {
  addReaction: (
    targetId: string,
    isLike: boolean,
    targetType: ReactionTarget
  ) =>
    apiClient.put(pathFor(targetId, targetType), {
      value: isLike ? "like" : "dislike",
    }),

  removeReaction: (targetId: string, targetType: ReactionTarget) =>
    apiClient.delete(pathFor(targetId, targetType)),

  countLikes: (targetId: string, targetType: ReactionTarget) =>
    apiClient.get(`${pathFor(targetId, targetType)}/count`),

  status: (targetId: string, targetType: ReactionTarget) =>
    apiClient.get(pathFor(targetId, targetType)),
};

export default reactionApi;
