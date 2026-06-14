import api from "../api/axios";
import { Review, ReviewImage } from "../types/type";

export const reviewService = {
  write: (review: Review) => api.post<string>("/reviews", review),
  modify: (reviewId: string, review: Review) =>
    api.put(`/reviews/${reviewId}`, review),
  remove: (reviewId: string) => api.delete(`/reviews/${reviewId}`),
  getRecipeReviews: (recipeCode: string) =>
    api.get<Review[]>(`/reviews/recipe/${recipeCode}`),
  getMyReviews: (userId: string) => api.get<Review[]>(`/reviews/my/${userId}`),

  uploadImages: (reviewId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return api.post(`/review-images/${reviewId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getRecipeReviewImages: (recipeCode: string) =>
    api.get<ReviewImage[]>(`/review-images/recipe/${recipeCode}`),
};
