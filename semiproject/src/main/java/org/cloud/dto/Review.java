package org.cloud.dto;

import lombok.Data;

@Data
public class Review {
	private String recipeCode;
	private String id;
	private String reviewContent;
	private int reviewHit;
	private boolean thumbsUp;

	private int reviewId;
	private String regDate;

	public String getRecipeCode() {
		return recipeCode;
	}

	public void setRecipeCode(String recipeCode) {
		this.recipeCode = recipeCode;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getReviewContent() {
		return reviewContent;
	}

	public void setReviewContent(String reviewContent) {
		this.reviewContent = reviewContent;
	}

	public int getReviewHit() {
		return reviewHit;
	}

	public void setReviewHit(int reviewHit) {
		this.reviewHit = reviewHit;
	}

	public boolean isThumbsUp() {
		return thumbsUp;
	}

	public void setThumbsUp(boolean thumbsUp) {
		this.thumbsUp = thumbsUp;
	}

	public int getReviewId() {
		return reviewId;
	}

	public void setReviewId(int reviewId) {
		this.reviewId = reviewId;
	}

	public String getRegDate() {
		return regDate;
	}

	public void setRegDate(String regDate) {
		this.regDate = regDate;
	}

}
