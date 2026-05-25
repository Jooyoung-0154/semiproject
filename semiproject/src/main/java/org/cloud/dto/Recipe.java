package org.cloud.dto;

import java.util.ArrayList;
import java.util.List;

public class Recipe {

    private String recipeCode;         // RECIPE_ID (varchar)
    private Recipe_Info recipeInfo;
    private List<Cooking_Info> cookingInfo;
    private List<Irdnt_Info> irdntInfo;
    private int hit;
    private int likeCount;             // DB: LIKE_COUNT
    private int price;                // DB: PRICE

    private List<Tag> tags = new ArrayList<>();
    private String writerId;      // 작성자 ID

    public String getRecipeCode() { return recipeCode; }
    public void setRecipeCode(String recipeCode) { this.recipeCode = recipeCode; }

    public Recipe_Info getRecipeInfo() { return recipeInfo; }
    public void setRecipeInfo(Recipe_Info recipeInfo) { this.recipeInfo = recipeInfo; }

    public List<Cooking_Info> getCookingInfo() { return cookingInfo; }
    public void setCookingInfo(List<Cooking_Info> cookingInfo) { this.cookingInfo = cookingInfo; }

    public List<Irdnt_Info> getIrdntInfo() { return irdntInfo; }
    public void setIrdntInfo(List<Irdnt_Info> irdntInfo) { this.irdntInfo = irdntInfo; }

    public int getHit() { return hit; }
    public void setHit(int hit) { this.hit = hit; }

    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public List<Tag> getTags() { return tags; }
    public void setTags(List<Tag> tags) { this.tags = tags; }

    public String getWriterId() { return writerId; }
    public void setWriterId(String writerId) { this.writerId = writerId; }
}
