package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Review {
    private String recipeCode;
    private String id;
    private String reviewContent;
    private boolean thumbsUp;
    private String reviewId;
    private String regDate;
}
