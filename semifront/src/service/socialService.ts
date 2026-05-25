import api from "../api/axios";
import { Follow, Member } from "../types/type";

export const socialService = {
  // 팔로우 하기
  follow: (follow: Follow) => api.post("/social/follow", follow),

  // 언팔로우 하기 (Controller가 @DeleteMapping에서 @RequestBody를 사용하므로 data 속성에 넣음)
  unfollow: (follow: Follow) =>
    api.delete("/social/unfollow", { data: follow }),

  // 특정 유저의 팔로잉 목록 조회 (팔로워 수 내림차순)
  getFollowingUsers: (userId: string) =>
    api.get<Member[]>(`/social/following/${userId}`),

  // 팔로우 여부 확인
  checkFollow: (followerId: string, followingId: string) =>
    api.get<boolean>("/social/check", { params: { followerId, followingId } }),
};
