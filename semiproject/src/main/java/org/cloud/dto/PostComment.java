package org.cloud.dto;

import lombok.Data;

@Data
public class PostComment {
    private int commentId;
    private int postId;          
    private String writerId; 
    private String content;
    private String regDate;
}