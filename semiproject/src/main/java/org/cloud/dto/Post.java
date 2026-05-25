package org.cloud.dto;

import java.util.List;

import lombok.Data;

@Data
public class Post {
	private int postId;          
    private String writerId;     
    private String content;
    private String postImg;
    private String regDate;     
    private int likeCount;       
    private List<PostComment> comments;
}
