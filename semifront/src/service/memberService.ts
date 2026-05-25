import api from "../api/axios";
import { Member } from "../types/type";

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface RegisterParams {
  id: string;
  password: string;
  nickname: string;
}

export const memberService = {
  // 회원가입
  register: (member: RegisterParams) => api.post<RegisterResponse>("/member/register", member),

  
  updateProfileImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/member/${id}/profile-image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 잔액 조회
  getBalance: (id: string) => api.get<number>(`/member/${id}/balance`),

  // 닉네임 수정 (RequestParam 방식)
  updateNickname: (id: string, newNickname: string) =>
    api.put(`/member/${id}/nickname`, null, { params: { newNickname } }),

  // 잔액 충전
  chargeBalance: (id: string, amount: number) =>
    api.post(`/member/${id}/balance/charge`, null, { params: { amount } }),

  // 회원 탈퇴
  deleteMember: (id: string) => api.delete(`/member/${id}`),

  // 회원 조회 by ID
  getMemberById: (id: string) => api.get<Member>(`/member/${id}`),
};
