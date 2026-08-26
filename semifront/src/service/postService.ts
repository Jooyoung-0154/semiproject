import api from "../api/axios";
import { Post, PostComment } from "../types/type";

export const postService = {
  getList: (writerId?: string) =>
    api.get<Post[]>("/posts", {
      params: {
        ...(writerId ? { writerId } : {}),
      },
    }),

  getByWriter: (writerId: string) =>
    api.get<Post[]>("/posts", {
      params: {
        writerId,
      },
    }),

  getDetail: (postId: string) => api.get<Post>(`/posts/${postId}`),

  write: (post: Post) => api.post("/posts/json", post),

  writeWithImage: (formData: FormData) => api.post("/posts", formData),

  modify: (postId: string, post: Post) => api.put(`/posts/${postId}`, post),

  modifyWithImage: (postId: string, formData: FormData) =>
    api.put(`/posts/${postId}/image`, formData),

  deletePost: (postId: string) => api.delete(`/posts/${postId}`),

  addComment: (comment: Omit<PostComment, "writerId">) =>
    api.post("/posts/comment", comment),

  deleteComment: (commentId: number) =>
    api.delete(`/posts/comment/${commentId}`),

  updateComment: (commentId: number, comment: PostComment) =>
    api.put(`/posts/comment/${commentId}`, comment),

  toggleLike: (postId: string) => api.post(`/posts/${postId}/like`),
};
