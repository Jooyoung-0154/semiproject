package org.cloud.service;

import java.util.List;

import org.cloud.dto.Follow;
import org.cloud.dto.Member;
import org.cloud.mapper.FollowMapper;
import org.cloud.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

    @Autowired
    private FollowMapper followMapper;
    
    @Autowired
    private MemberMapper memberMapper;

    @Transactional
    public boolean follow(Follow follow) {
        if (followMapper.checkFollow(follow) > 0) return false; // 이미 팔로우 중

        // 1. 관계 등록
        followMapper.insertFollow(follow);
        memberMapper.addFollowCount(follow.getFollowerId(), "FOLLOWING_COUNT", 1);
        memberMapper.addFollowCount(follow.getFollowingId(), "FOLLOWER_COUNT", 1);
        
        return true;
    }

    // 특정 유저가 팔로우하는 사람들의 상세 정보 (팔로워 수 내림차순)
    public List<Member> getFollowingUsersInfo(String userId) {
        return followMapper.getFollowingUsersInfo(userId);
    }

    // 팔로우 여부 확인
    public boolean checkFollow(Follow follow) {
        return followMapper.checkFollow(follow) > 0;
    }

    // 팔로우 취소
    @Transactional
    public boolean unfollow(Follow follow) {
        if (followMapper.deleteFollow(follow) > 0) {
            memberMapper.addFollowCount(follow.getFollowerId(), "FOLLOWING_COUNT", -1);
            memberMapper.addFollowCount(follow.getFollowingId(), "FOLLOWER_COUNT", -1);
            return true;
        }
        return false;
    }
}