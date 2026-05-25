package org.cloud.dto;

import java.util.List;

import lombok.Data;

@Data
public class Member {
	private String id;
	private String password;
	private int balance;

	private String nickname;
	private String profileImg;
	private String intro;
	
	private List<String> followerIds;
	private List<String> followingIds;
	
	private List<Review> myReviews;
	private List<Post> myPosts;
	
	// 내가 팔로우하는 사람들의 수
    private int followingCount; 
    
    // 나를 팔로우하는 사람들의 수
    private int followerCount;

    // 작성한 레시피 수
    private int recipeCount;
}
