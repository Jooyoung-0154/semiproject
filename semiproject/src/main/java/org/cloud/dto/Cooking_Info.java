package org.cloud.dto;

import lombok.Data;

@Data
public class Cooking_Info {
    private String recipeId;
    private int cookingNo;
    private String cookingDc;
    private String stepTip;
    private String stepImgUrl;
    private String imgType;
}
