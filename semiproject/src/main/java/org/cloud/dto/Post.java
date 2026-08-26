package org.cloud.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Post {
    private String postId;
    private String writerId;
    private String content;
    private String postImg;
    private String regDate;
    private int likeCount;
    private boolean liked;
    private List<PostComment> comments;
}
