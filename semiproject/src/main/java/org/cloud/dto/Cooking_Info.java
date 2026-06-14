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

	public String getRecipeId() {
		return recipeId;
	}

	public void setRecipeId(String recipeId) {
		this.recipeId = recipeId;
	}

	public int getCookingNo() {
		return cookingNo;
	}

	public void setCookingNo(int cookingNo) {
		this.cookingNo = cookingNo;
	}

	public String getCookingDc() {
		return cookingDc;
	}

	public void setCookingDc(String cookingDc) {
		this.cookingDc = cookingDc;
	}

	public String getStepTip() {
		return stepTip;
	}

	public void setStepTip(String stepTip) {
		this.stepTip = stepTip;
	}

	public String getStepImgUrl() {
		return stepImgUrl;
	}

	public void setStepImgUrl(String stepImgUrl) {
		this.stepImgUrl = stepImgUrl;
	}

	public String getImgType() {
		return imgType;
	}

	public void setImgType(String imgType) {
		this.imgType = imgType;
	}

}
