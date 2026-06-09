package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Member;

@Mapper
public interface MemberMapper {

    int insertMember(Member member);

    int checkId(String ID);

    int checkNickname(String NICKNAME);

    int updateNickname(@Param("ID") String ID, @Param("NICKNAME") String NICKNAME);

    int updatePassword(@Param("ID") String ID, 
                       @Param("oldPassword") String oldPassword, 
                       @Param("newPassword") String newPassword);

    int getBalance(String ID);

    int updateBalance(@Param("ID") String ID, @Param("amount") int amount);

    int updateProfileImg(@Param("ID") String ID, @Param("PROFILE_IMG") String PROFILE_IMG);

    int addFollowingCount(@Param("ID") String ID, @Param("amount") int amount);

    int addFollowerCount(@Param("ID") String ID, @Param("amount") int amount);
    	
    int deleteMember(@Param("ID") String ID);
    
    Member selectMemberById(String id);

    List<Member> searchMembers(String keyword);
    
    int updateIntro(@Param("id") String id, @Param("intro") String intro);
}