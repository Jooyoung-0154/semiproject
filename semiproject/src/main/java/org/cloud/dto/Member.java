package org.cloud.dto;

import java.util.List;
import java.time.LocalDate;

import lombok.Data;

@Data
public class Member {
	private String id;
	private String password;
	private int balance;

	private String nickname;
	private String profileImg;
	private String intro;

	private LocalDate birthDate;
	private String gender;
	private String status;

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

	// 스크랩 레시피 공개 여부
	private boolean scrapPublic = true;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public int getBalance() {
		return balance;
	}

	public void setBalance(int balance) {
		this.balance = balance;
	}

	public String getNickname() {
		return nickname;
	}

	public void setNickname(String nickname) {
		this.nickname = nickname;
	}

	public String getProfileImg() {
		return profileImg;
	}

	public void setProfileImg(String profileImg) {
		this.profileImg = profileImg;
	}

	public String getIntro() {
		return intro;
	}

	public void setIntro(String intro) {
		this.intro = intro;
	}

	public List<String> getFollowerIds() {
		return followerIds;
	}

	public void setFollowerIds(List<String> followerIds) {
		this.followerIds = followerIds;
	}

	public List<String> getFollowingIds() {
		return followingIds;
	}

	public void setFollowingIds(List<String> followingIds) {
		this.followingIds = followingIds;
	}

	public List<Review> getMyReviews() {
		return myReviews;
	}

	public void setMyReviews(List<Review> myReviews) {
		this.myReviews = myReviews;
	}

	public List<Post> getMyPosts() {
		return myPosts;
	}

	public void setMyPosts(List<Post> myPosts) {
		this.myPosts = myPosts;
	}

	public int getFollowingCount() {
		return followingCount;
	}

	public void setFollowingCount(int followingCount) {
		this.followingCount = followingCount;
	}

	public int getFollowerCount() {
		return followerCount;
	}

	public void setFollowerCount(int followerCount) {
		this.followerCount = followerCount;
	}

	public int getRecipeCount() {
		return recipeCount;
	}

	public void setRecipeCount(int recipeCount) {
		this.recipeCount = recipeCount;
	}

	public boolean isScrapPublic() {
		return scrapPublic;
	}

	public void setScrapPublic(boolean scrapPublic) {
		this.scrapPublic = scrapPublic;
	}

}
