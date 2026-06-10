import api from "../api/axios";
import { Review, ReviewImage } from "../types/type";

export const reviewService = {
  write: (review: Review) => api.post<number>("/reviews", review),
  modify: (reviewId: number, review: Review) => api.put(`/reviews/${reviewId}`, review),
  remove: (reviewId: number) => api.delete(`/reviews/${reviewId}`),
  getRecipeReviews: (recipeCode: string) => api.get<Review[]>(`/reviews/recipe/${recipeCode}`),
  getMyReviews: (userId: string) => api.get<Review[]>(`/reviews/my/${userId}`),

  uploadImages: (reviewId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
<<<<<<< HEAD
    return api.post(`/review-images/${reviewId}/upload`, formData);
=======
    return api.post(`/review-images/${reviewId}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
  },

  getRecipeReviewImages: (recipeCode: string) =>
    api.get<ReviewImage[]>(`/review-images/recipe/${recipeCode}`),
};
