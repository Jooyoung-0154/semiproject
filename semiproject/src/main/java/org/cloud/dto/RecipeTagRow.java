package org.cloud.dto;

public class RecipeTagRow {
    private String recipeId;
    private int tagId;
    private String tagName;

    public String getRecipeId() { return recipeId; }
    public void setRecipeId(String recipeId) { this.recipeId = recipeId; }
    public int getTagId() { return tagId; }
    public void setTagId(int tagId) { this.tagId = tagId; }
    public String getTagName() { return tagName; }
    public void setTagName(String tagName) { this.tagName = tagName; }
}
