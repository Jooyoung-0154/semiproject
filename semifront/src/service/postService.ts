import api from "../api/axios";
import { Post, PostComment } from "../types/type";

export const postService = {
  // 전체 게시글 조회
  getList: () => api.get<Post[]>("/posts"),

  // 개인 게시글 조회
  getByWriter: (writerId: string) =>
    api.get<Post[]>(`/posts?writerId=${encodeURIComponent(writerId)}`),
  // 백엔드에서 GET /posts?writerId=<writerId> 요청을 처리하여 특정 작성자의 게시글 목록을 반환하도록 구현되어야 합니다.

  // 게시글 상세 조회
  getDetail: (postId: number) => api.get<Post>(`/posts/${postId}`),

  // 게시글 작성
  write: (post: Post) => api.post("/posts", post),

  // 이미지가 포함된 게시글 작성
  writeWithImage: (formData: FormData) =>
    api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // 게시글 수정
  modify: (postId: number, post: Post) => api.put(`/posts/${postId}`, post),

  // 게시글 삭제
  deletePost: (postId: number) => api.delete(`/posts/${postId}`),

  // 댓글 추가
  addComment: (comment: PostComment) => api.post("/posts/comment", comment),

  // 댓글 삭제
  deleteComment: (commentId: number) =>
    api.delete(`/posts/comment/${commentId}`),
};

