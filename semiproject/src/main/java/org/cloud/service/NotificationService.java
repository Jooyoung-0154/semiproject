package org.cloud.service;

import java.util.List;

import org.cloud.dto.Notification;
import org.cloud.mapper.NotificationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationMapper notificationMapper;

    public boolean createNotification(String receiverId, String senderId, String type, String targetId, String message) {
        if (receiverId == null || receiverId.isBlank()) return false;
        if (senderId == null || senderId.isBlank()) return false;
        if (receiverId.equals(senderId)) return false;

        try {
            Notification notification = new Notification();
            notification.setReceiverId(receiverId);
            notification.setSenderId(senderId);
            notification.setType(type);
            notification.setTargetId(targetId);
            notification.setMessage(message);
            return notificationMapper.insertNotification(notification) > 0;
        } catch (Exception e) {
            System.out.println("알림 저장 실패: " + e.getMessage());
            return false;
        }
    }

    public List<Notification> getNotificationList(String receiverId) {
        return notificationMapper.getNotificationList(receiverId);
    }

    public boolean readNotification(int notiId) {
        return notificationMapper.readNotification(notiId) > 0;
    }

    public boolean readAll(String receiverId) {
        notificationMapper.readAll(receiverId);
        return true;
    }

    public int getUnreadCount(String receiverId) {
        return notificationMapper.getUnreadCount(receiverId);
    }
}
