import api from "../api/axios";
import { Purchase } from "../types/type";

export const purchaseService = {
  // 레시피 구매 프로세스
  processPurchase: (purchase: Purchase, cartId: number = 0) =>
    api.post("/recipe/purchase", purchase, { params: { cartId } }),

  // 내 구매 내역 조회
  getMyHistory: (userId: string) =>
    api.get<Purchase[]>(`/recipe/purchase/my/${userId}`),

  // 특정 레시피 구매 여부 확인 (프론트엔드 권한 제어용)
  checkPurchased: (userId: string, recipeCode: string) =>
    api.get<boolean>("/recipe/purchase/check", {
      params: { userId, recipeCode },
    }),
};
