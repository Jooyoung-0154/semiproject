package org.cloud.dto;

import lombok.Data;

@Data
public class RecipeTag {
	private String recipeId;
	private int tagId;

	public String getRecipeId() {
		return recipeId;
	}

	public void setRecipeId(String recipeId) {
		this.recipeId = recipeId;
	}

	public int getTagId() {
		return tagId;
	}

	public void setTagId(int tagId) {
		this.tagId = tagId;
	}

}
