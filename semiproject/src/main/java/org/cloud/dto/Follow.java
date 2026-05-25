package org.cloud.dto;

import lombok.Data;

@Data
public class Follow {
    private String followerId;  // 팔로우를 누른 사람 (나)
    private String followingId; // 팔로우를 당한 사람 (스타)
}
