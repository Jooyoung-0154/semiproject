package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Notification {
    private int notiId;
    private String receiverId;
    private String senderId;
    private String type;
    private String targetId;
    private String message;
    private boolean isRead;
    private String regDate;
}
