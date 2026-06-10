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

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public boolean follow(Follow follow) {
        if (followMapper.checkFollow(follow) > 0) return false;

        followMapper.insertFollow(follow);
        memberMapper.addFollowingCount(follow.getFollowerId(), 1);
        memberMapper.addFollowerCount(follow.getFollowingId(), 1);

        try {
            notificationService.createNotification(
                    follow.getFollowingId(),
                    follow.getFollowerId(),
                    "FOLLOW",
                    follow.getFollowerId(),
                    follow.getFollowerId() + "님이 회원님을 구독했습니다."
            );
        } catch (Exception e) {
            System.out.println("구독 알림 저장 실패: " + e.getMessage());
        }

        return true;
    }

    public List<Member> getFollowingUsersInfo(String userId) {
        return followMapper.getFollowingUsersInfo(userId);
    }

    public boolean checkFollow(Follow follow) {
        return followMapper.checkFollow(follow) > 0;
    }

    @Transactional
    public boolean unfollow(Follow follow) {
        if (followMapper.deleteFollow(follow) > 0) {
            memberMapper.addFollowingCount(follow.getFollowerId(), -1);
            memberMapper.addFollowerCount(follow.getFollowingId(), -1);
            return true;
        }
        return false;
    }
}
