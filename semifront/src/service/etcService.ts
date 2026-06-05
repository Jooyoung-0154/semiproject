import api from "../api/axios";

export const adminService = {
  // 레시피 공공 데이터 동기화 시작
  startBatch: () => api.get<string>("/admin/batch-init"),
};
