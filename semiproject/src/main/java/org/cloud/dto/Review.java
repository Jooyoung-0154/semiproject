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
}
