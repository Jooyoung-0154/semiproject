import api from "../api/axios";
import { Review } from "../types/type";

export const reviewService = {
  // 리뷰 작성
  write: (review: Review) => api.post("/reviews", review),

  // 리뷰 수정
  modify: (reviewId: number, review: Review) =>
    api.put(`/reviews/${reviewId}`, review),

  // 리뷰 삭제
  remove: (reviewId: number) => api.delete(`/reviews/${reviewId}`),

  // 특정 레시피의 리뷰 목록 조회
  getRecipeReviews: (recipeCode: string) =>
    api.get<Review[]>(`/reviews/recipe/${recipeCode}`),

  // 내가 쓴 리뷰 목록 조회
  getMyReviews: (userId: string) => api.get<Review[]>(`/reviews/my/${userId}`),
};
