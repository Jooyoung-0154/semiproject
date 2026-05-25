import api from "../api/axios";
import { Tag } from "../types/type";

export const tagService = {
  // 모든 태그 목록 조회
  getAllTags: () => api.get<Tag[]>("/recipe/tags"),

  // 새 태그 생성 (관리자용)
  createTag: (tag: Tag) => api.post("/tags", tag),

  // 태그 삭제 (관리자용)
  deleteTag: (tagId: number) => api.delete(`/tags/${tagId}`),

  // 특정 레시피에 태그 할당/수정
  assignTagsToRecipe: (recipeId: string, tagIds: number[]) =>
    api.post(`/tags/recipe/${recipeId}`, tagIds),

  // 특정 레시피의 태그 목록 조회
  getRecipeTags: (recipeId: string) =>
    api.get<Tag[]>(`/tags/recipe/${recipeId}`),
};
