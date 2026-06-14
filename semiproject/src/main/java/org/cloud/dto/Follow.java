package org.cloud.dto;

import lombok.Data;

@Data
public class Follow {
    private String followerId;  // 팔로우를 누른 사람 (나)
    private String followingId; // 팔로우를 당한 사람 (스타)

    public Follow() {}

    public Follow(String followerId, String followingId) {
        this.followerId = followerId;
        this.followingId = followingId;
    }

	public String getFollowerId() {
		return followerId;
	}
	public void setFollowerId(String followerId) {
		this.followerId = followerId;
	}
	public String getFollowingId() {
		return followingId;
	}
	public void setFollowingId(String followingId) {
		this.followingId = followingId;
	}
   
}
