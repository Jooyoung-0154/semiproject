	package org.cloud.dto;

import lombok.Data;

@Data
public class Guestbook {
    private int guestbookId;
    private String hostId;
    private String writerId;
    private String content;
    private String regDate;
    private String writerNickname;
}