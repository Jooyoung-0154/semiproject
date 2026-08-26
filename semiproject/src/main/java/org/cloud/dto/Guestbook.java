package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Guestbook {
    private int guestbookId;
    private String hostId;
    private String writerId;
    private String content;
    private String regDate;
    private String writerNickname;
}
