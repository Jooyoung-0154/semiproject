import api from "../api/axios";

const likeService = {
  /** 좋아요 토글 → { liked: boolean, likeCount: number } */
  toggle: async (userId: string, recipeCode: string) => {
    const res = await api.post("/like/toggle", { userId, recipeCode });
    return res.data as { liked: boolean; likeCount: number };
  },

  /** 유저가 좋아요한 레시피 ID 목록 */
  getMyLikes: async (userId: string): Promise<string[]> => {
    const res = await api.get(`/like/my/${userId}`);
    return res.data;
  },
};

export default likeService;
