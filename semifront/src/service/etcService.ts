import api from "../api/axios";
import { Charge } from "../types/type";

export const paymentService = {
  // 포인트 충전
  charge: (charge: Charge) => api.post("/payment/charge", charge),

  // 충전 내역 조회
  getHistory: (userId: string) =>
    api.get<Charge[]>(`/payment/history/${userId}`),

  // 충전 내역 삭제
  deleteHistory: (chargeId: number) =>
    api.delete(`/payment/history/${chargeId}`),
};

export const adminService = {
  // 레시피 공공 데이터 동기화 시작
  startBatch: () => api.get<string>("/admin/batch-init"),
};
