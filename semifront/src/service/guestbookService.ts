import api from "../api/axios";
import { Guestbook } from "../types/type";

export const guestbookService = {
  // 방명록 작성
  write: (guestbook: Guestbook) => api.post("/guestbook", guestbook),

  // 방명록 수정
  modify: (guestbook: Guestbook) => api.put("/guestbook", guestbook),

  // 방명록 삭제 (여러 파라미터 전달)
  remove: (
    guestbookId: number,
    accessId: string,
    writerId: string,
    hostId: string,
  ) =>
    api.delete(`/guestbook/${guestbookId}`, {
      params: { accessId, writerId, hostId },
    }),

  // 방명록 목록 조회 (페이징 데이터 포함)
  getList: (hostId: string, page: number = 1) =>
    api.get<{ list: Guestbook[]; totalCount: number }>(`/guestbook/${hostId}`, {
      params: { page },
    }),
};
