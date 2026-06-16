import api from "../api/axios";
import { Recipe_Info, Irdnt_Info, Cooking_Info, Tag } from "../types/type";

export interface RecipePayload {
  recipeInfo: Recipe_Info;
  irdntInfo: Irdnt_Info[];
  cookingInfo: Cooking_Info[];
  price: number;
  writerId: string;
  tags: Tag[];
  existingMainImgUrls?: string[];
}

export interface BrowseParams {
  name?: string;
  tagIds?: number[];
  level?: string;
  ingredients?: string[];
  sortType?: string;
  page?: number;
  size?: number;
  cookingTimeFilter?: string;
  signal?: AbortSignal;
}

export interface BrowseResult {
  recipes: import("../types/type").Recipe_Info[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

const RecipeService = {
  browse: async (params: BrowseParams): Promise<BrowseResult> => {
    const response = await api.get("/recipe/browse", {
      params: {
        name: params.name || undefined,
        tagIds: params.tagIds?.length ? params.tagIds.join(",") : undefined,
        level: params.level || undefined,
        ingredients: params.ingredients?.length
          ? params.ingredients.join(",")
          : undefined,
        sortType: params.sortType || "all",
        page: params.page || 1,
        size: params.size || 12,
        cookingTimeFilter: params.cookingTimeFilter || "all",
      },
      signal: params.signal,
    });
    console.log("응답 첫 레시피:", response.data?.recipes?.[0]);
    return response.data;
  },

  // 1. 레시피 목록 조회 (기존에 등록 로직이 잘못 들어가 있던 부분을 수정했습니다)
  getRecipes: async (name?: string, tagId?: number) => {
    try {
      const response = await api.get("/recipe/list", {
        params: {
          name: name || undefined,
          tagId: tagId || undefined,
        },
      });
      return response.data;
    } catch (error) {
      console.error("조회 중 오류 발생:", error);
      throw error;
    }
  },

  // 2. 레시피 등록
  registerRecipe: async (recipeData: RecipePayload) => {
    try {
      const response = await api.post("/recipe/register", recipeData);
      return response.data; // 성공 시 생성된 recipeId 반환
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
      throw error;
    }
  },

  // 2-1. 작성자 ID로 레시피 목록 조회 (MyPage 전용)
  getByWriter: async (
    writerId: string,
  ): Promise<import("../types/type").Recipe_Info[]> => {
    const response = await api.get(`/recipe/by-writer/${writerId}`);
    return response.data;
  },

  // 3. 레시피 단건 상세 조회
  getById: async (
    recipeId: string,
  ): Promise<import("../types/type").Recipe> => {
    const response = await api.get(`/recipe/${recipeId}`);
    return response.data;
  },

  // 4. 레시피 수정
  updateRecipe: async (recipeId: string, recipeData: RecipePayload) => {
    const response = await api.put(`/recipe/${recipeId}`, recipeData);
    return response.data;
  },

  // 5. 레시피 삭제
  deleteRecipe: async (recipeId: string) => {
    try {
      const response = await api.delete(`/recipe/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      throw error;
    }
  },

  // 6. 조회수 증가
  incrementHit: (recipeId: string) => api.put(`/recipe/${recipeId}/hit`),
};

export default RecipeService;
