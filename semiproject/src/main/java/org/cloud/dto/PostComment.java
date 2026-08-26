package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostComment {
    private int commentId;
    private String postId;
    private String writerId;
    private String content;
    private String regDate;
}
