package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Notification;

@Mapper
public interface NotificationMapper {
    int insertNotification(Notification notification);
    List<Notification> getNotificationList(@Param("receiverId") String receiverId);
    int readNotification(@Param("notiId") int notiId);
    int readAll(@Param("receiverId") String receiverId);
    int getUnreadCount(@Param("receiverId") String receiverId);
}
