import api from "../api/axios";
import { Post, PostComment } from "../types/type";

export const postService = {
  getList: (writerId?: string, viewerId?: string) =>
    api.get<Post[]>("/posts", {
      params: {
        ...(writerId ? { writerId } : {}),
        ...(viewerId ? { viewerId } : {}),
      },
    }),

  getByWriter: (writerId: string, viewerId?: string) =>
    api.get<Post[]>("/posts", {
      params: {
        writerId,
        ...(viewerId ? { viewerId } : {}),
      },
    }),

  getDetail: (postId: string, viewerId?: string) =>
    api.get<Post>(`/posts/${postId}`, {
      params: viewerId ? { viewerId } : {},
    }),

  write: (post: Post) => api.post("/posts/json", post),

  writeWithImage: (formData: FormData) => api.post("/posts", formData),

  modify: (postId: string, post: Post) => api.put(`/posts/${postId}`, post),

  modifyWithImage: (postId: string, formData: FormData) =>
    api.put(`/posts/${postId}/image`, formData),

  // 게시글 삭제: 백엔드 권한 확인용 requesterId 전달
  deletePost: (postId: string, requesterId: string) =>
    api.delete(`/posts/${postId}`, { params: { requesterId } }),

  addComment: (comment: PostComment) => api.post("/posts/comment", comment),

  deleteComment: (commentId: number, requesterId: string) =>
    api.delete(`/posts/comment/${commentId}`, { params: { requesterId } }),

  updateComment: (commentId: number, comment: PostComment) =>
    api.put(`/posts/comment/${commentId}`, comment),

  toggleLike: (postId: string, userId: string) =>
    api.post(`/posts/${postId}/like`, null, { params: { userId } }),
};
