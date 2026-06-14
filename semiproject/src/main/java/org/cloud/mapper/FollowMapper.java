	package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Follow;
import org.cloud.dto.Member;

@Mapper
public interface FollowMapper {
    // 팔로우 등록
    int insertFollow(Follow follow);

    // 팔로우 취소
    int deleteFollow(Follow follow);

    // 팔로우 여부 확인 (이미 팔로우했는지 체크용)
    int checkFollow(Follow follow);

    // 특정 유저가 팔로우하는 사람들의 상세 정보 조회 (팔로워 수 내림차순)
    List<Member> getFollowingUsersInfo(@Param("userId") String userId);
}