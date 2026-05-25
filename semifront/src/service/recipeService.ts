import api from "../api/axios";

export interface BrowseParams {
  name?: string;
  tagId?: number;
  level?: string;
  ingredients?: string[];
  page?: number;
  size?: number;
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
        tagId: params.tagId || undefined,
        level: params.level || undefined,
        ingredients: params.ingredients?.length
          ? params.ingredients.join(",")
          : undefined,
        page: params.page || 1,
        size: params.size || 12,
      },
    });
    console.log("🔍 browse 응답 첫번째 레시피:", response.data?.recipes?.[0]);
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

  // 2. 레시피 등록 (매개변수에 : any를 추가하여 타입 오류를 해결했습니다)
  registerRecipe: async (recipeData: any) => {
    try {
      const response = await api.post("/recipe/register", recipeData);
      return response.data; // 성공 시 생성된 recipeId 반환
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
      throw error;
    }
  },

  // 2-1. 작성자 ID로 레시피 목록 조회 (MyPage 전용)
  getByWriter: async (writerId: string): Promise<import("../types/type").Recipe_Info[]> => {
    const response = await api.get(`/recipe/by-writer/${writerId}`);
    return response.data;
  },

  // 3. 레시피 삭제
  deleteRecipe: async (recipeId: string) => {
    try {
      const response = await api.delete(`/recipe/${recipeId}`);
      return response.data; // true/false 반환
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      throw error;
    }
  },
};

export default RecipeService;
