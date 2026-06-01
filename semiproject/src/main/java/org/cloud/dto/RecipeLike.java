package org.cloud.dto;

import lombok.Data;

@Data
public class RecipeLike {
    private int likeId;        // 좋아요 고유 번호
    private String userId;     // 좋아요 누른 유저
    private String recipeCode; // 좋아요한 레시피
    private String likeDate;   // 좋아요 일시
}
