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
  birthDate: string;
  gender: string;
}

export const memberService = {
  // 회원가입
  register: (member: RegisterParams) =>
    api.post<RegisterResponse>("/member/register", member),

  updateProfileImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/member/${id}/profile-image`, formData);
  },

  // 소개글
  updateIntro: (id: string, intro: string) =>
    api.put(`/member/${id}/intro`, null, {
      params: { intro },
    }),

  // 잔액 조회
  getBalance: (id: string) => api.get<number>(`/member/${id}/balance`),

  // 닉네임 수정 (RequestParam 방식)
  updateNickname: (id: string, newNickname: string) =>
    api.put(`/member/${id}/nickname`, null, { params: { newNickname } }),

  // 회원 탈퇴
  deleteMember: (id: string) => api.delete(`/member/${id}`),

  // 회원 조회 by ID
  getMemberById: (id: string) => api.get<Member>(`/member/${id}`),

  // 회원 검색 (관리자용)
  searchMembers: (keyword: string) =>
    api.get<Member[]>(`/member/search`, { params: { keyword } }),

  // 스크랩 공개 여부 변경
  updateScrapPublic: (id: string, scrapPublic: boolean) =>
    api.put(`/member/${id}/scrap-public`, null, { params: { scrapPublic } }),

  // SNS 링크 변경
  updateSnsSocial: (id: string, youtube: string, instagram: string, facebook: string) =>
    api.put(`/member/${id}/sns`, null, { params: { youtube, instagram, facebook } }),
};
