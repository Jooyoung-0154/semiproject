import api from "../api/axios";

export const recipeImageService = {
  // 레시피 이미지들 업로드 (FormData 사용)
  uploadImages: (recipeCode: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.post(`/recipe-images/${recipeCode}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 레시피 이미지 수정 (기존 삭제 후 새 등록)
  updateImages: (recipeCode: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return api.put(`/recipe-images/${recipeCode}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
