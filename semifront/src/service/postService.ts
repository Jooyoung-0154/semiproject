import api from "../api/axios";
import { Post, PostComment } from "../types/type";

export const postService = {
  // 전체 게시글 조회
  getList: () => api.get<Post[]>("/posts"),

  // 개인 게시글 조회
  getByWriter: (writerId: string) =>
    api.get<Post[]>(`/posts?writerId=${encodeURIComponent(writerId)}`),

  // 게시글 상세 조회
  getDetail: (postId: number) => api.get<Post>(`/posts/${postId}`),

  // 일반 게시글 작성
  write: (post: Post) => api.post("/posts/json", post),

  // 이미지 포함 게시글 작성
  writeWithImage: (formData: FormData) =>
    api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // 일반 게시글 수정
  modify: (postId: number, post: Post) => api.put(`/posts/${postId}`, post),

  // 이미지 포함 게시글 수정
  modifyWithImage: (postId: number, formData: FormData) =>
    api.put(`/posts/${postId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // 게시글 삭제 (인증은 서버 세션으로 처리)
  deletePost: (postId: number) => api.delete(`/posts/${postId}`),

  // 댓글 추가
  addComment: (comment: PostComment) => api.post("/posts/comment", comment),

  // 댓글 삭제
  deleteComment: (commentId: number) =>
    api.delete(`/posts/comment/${commentId}`),
  // 댓글 수정
  updateComment: (commentId: number, comment: any) =>
    api.put(`/posts/comment/${commentId}`, comment),
};
