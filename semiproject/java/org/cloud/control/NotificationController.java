package org.cloud.control;

import java.util.List;

import org.cloud.dto.Notification;
import org.cloud.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/{receiverId}")
    public List<Notification> getList(@PathVariable String receiverId) {
        return notificationService.getNotificationList(receiverId);
    }

    @GetMapping("/{receiverId}/unread-count")
    public int getUnreadCount(@PathVariable String receiverId) {
        return notificationService.getUnreadCount(receiverId);
    }

    @PutMapping("/{notiId}/read")
    public boolean read(@PathVariable int notiId) {
        return notificationService.readNotification(notiId);
    }

    @PutMapping("/{receiverId}/read-all")
    public boolean readAll(@PathVariable String receiverId) {
        return notificationService.readAll(receiverId);
    }
}
