import api from "../api/axios";
import { Notification } from "../types/type";

export const notificationService = {
  getList: (receiverId: string) =>
    api.get<Notification[]>(`/notifications/${receiverId}`),

  getUnreadCount: (receiverId: string) =>
    api.get<number>(`/notifications/${receiverId}/unread-count`),

  read: (notiId: number) =>
    api.put(`/notifications/${notiId}/read`),

  readAll: (receiverId: string) =>
    api.put(`/notifications/${receiverId}/read-all`),
};
