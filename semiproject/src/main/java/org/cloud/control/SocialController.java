	package org.cloud.control;

import java.util.List;

import org.cloud.dto.Follow;
import org.cloud.dto.Member;
import org.cloud.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/social")
public class SocialController {

    @Autowired
    private FollowService followService;


    @PostMapping("/follow")
    public boolean follow(@RequestBody Follow follow) {
        return followService.follow(follow);
    }

    @DeleteMapping("/unfollow")
    public boolean unfollow(@RequestBody Follow follow) {
        return followService.unfollow(follow);
    }

    // 특정 유저의 팔로잉 목록 (상세 정보 포함, 팔로워 수 내림차순)
    @GetMapping("/following/{userId}")
    public List<Member> getFollowingUsers(@PathVariable("userId") String userId) {
        return followService.getFollowingUsersInfo(userId);
    }

    // 팔로우 여부 확인
    @GetMapping("/check")
    public boolean checkFollow(
            @RequestParam("followerId") String followerId,
            @RequestParam("followingId") String followingId) {
        Follow follow = new Follow(followerId, followingId);
        return followService.checkFollow(follow);
    }
}