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

  updateProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/member/me/profile-image", formData);
  },

  // 소개글
  updateIntro: (intro: string) =>
    api.put("/member/me/intro", null, {
      params: { intro },
    }),

  // 닉네임 수정 (RequestParam 방식)
  updateNickname: (newNickname: string) =>
    api.put("/member/me/nickname", null, { params: { newNickname } }),

  // 회원 탈퇴
  deleteCurrentMember: () => api.delete("/member/me"),

  // 회원 조회 by ID
  getMemberById: (id: string) => api.get<Member>(`/member/${id}`),

  // 회원 검색 (관리자용)
  searchMembers: (keyword: string) =>
    api.get<Member[]>(`/member/search`, { params: { keyword } }),

  // 스크랩 공개 여부 변경
  updateScrapPublic: (scrapPublic: boolean) =>
    api.put("/member/me/scrap-public", null, { params: { scrapPublic } }),

  // SNS 링크 변경
  updateSnsSocial: (youtube: string, instagram: string, facebook: string) =>
    api.put("/member/me/sns", null, { params: { youtube, instagram, facebook } }),
};
