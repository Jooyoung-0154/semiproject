package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeLike {
    private int likeId;
    private String userId;
    private String recipeCode;
    private String likeDate;
}
