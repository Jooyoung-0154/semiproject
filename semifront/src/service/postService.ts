import api from "../api/axios";
import { Post, PostComment } from "../types/type";

export const postService = {
  getList: (viewerId?: string) =>
    api.get<Post[]>("/posts", { params: viewerId ? { viewerId } : {} }),

  getByWriter: (writerId: string, viewerId?: string) =>
    api.get<Post[]>("/posts", {
      params: {
        writerId,
        ...(viewerId ? { viewerId } : {}),
      },
    }),

  getDetail: (postId: number, viewerId?: string) =>
    api.get<Post>(`/posts/${postId}`, {
      params: viewerId ? { viewerId } : {},
    }),

  write: (post: Post) => api.post("/posts/json", post),

  writeWithImage: (formData: FormData) => api.post("/posts", formData),

  modify: (postId: number, post: Post) => api.put(`/posts/${postId}`, post),

  modifyWithImage: (postId: number, formData: FormData) =>
    api.put(`/posts/${postId}/image`, formData),

  deletePost: (postId: number, requesterId: string) =>
    api.delete(`/posts/${postId}`, { params: { requesterId } }),

  addComment: (comment: PostComment) => api.post("/posts/comment", comment),

  deleteComment: (commentId: number, requesterId: string) =>
    api.delete(`/posts/comment/${commentId}`, { params: { requesterId } }),

  updateComment: (commentId: number, comment: PostComment) =>
    api.put(`/posts/comment/${commentId}`, comment),

  toggleLike: (postId: number, userId: string) =>
    api.post(`/posts/${postId}/like`, null, { params: { userId } }),
};
