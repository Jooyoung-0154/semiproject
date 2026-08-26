package org.cloud.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Recipe {
    private String recipeCode;         // RECIPE_ID (varchar)
    private Recipe_Info recipeInfo;
    private List<Cooking_Info> cookingInfo;
    private List<Irdnt_Info> irdntInfo;
    private int hit;
    private int likeCount;             // DB: LIKE_COUNT
    private int price;                 // DB: PRICE
    private List<Tag> tags = new ArrayList<>();
    private String writerId;           // 작성자 ID
}
