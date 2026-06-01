package org.cloud.service;

import java.util.List;

import org.cloud.dto.Member;
import org.cloud.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
	public class MemberService {

	    @Autowired
	    private MemberMapper memberMapper;

	    public String register(Member member) {
	        // 아이디 중복 체크
	        if (memberMapper.checkId(member.getId()) > 0) {
	            return "이미 존재하는 아이디입니다.";
	        }
	        // 닉네임 중복 체크
	        if (memberMapper.checkNickname(member.getNickname()) > 0) {
	            return "이미 존재하는 닉네임입니다.";
	        }

	        int result = memberMapper.insertMember(member);
	        return result > 0 ? "회원 등록 완료" : "회원 등록 실패";
	    }

	    public boolean updateNickname(String id, String newNickname) {
	        // 닉네임 중복 체크 후 변경
	        if (memberMapper.checkNickname(newNickname) > 0) {
	            return false;
	        }
	        return memberMapper.updateNickname(id, newNickname) > 0;
	    }

	    public boolean login(String id, String password) {
	        System.out.println("===> login 메서드 진입 / 입력받은 id: " + id);

	        Member member = memberMapper.selectMemberById(id);

	        if (member == null) {
	            System.out.println("DB에서 해당 ID로 조회된 회원이 없습니다!");
	        } else {
	            System.out.println(" 회원 조회 성공! DB에 저장된 비밀번호: " + member.getPassword());
	        }

	        if (member != null && member.getPassword().equals(password)) {
	            return true;
	        }
	        return false;
	    }
	    public boolean updatePassword(String id, String oldPw, String newPw) {
	        return memberMapper.updatePassword(id, oldPw, newPw) > 0;
	    }

	    public int checkBalance(String id) {
	        return memberMapper.getBalance(id);
	    }

	    public boolean chargeBalance(String id, int amount) {
	        return memberMapper.updateBalance(id, amount) > 0;
	    }

	    public boolean processPurchase(String id, int price) {
	        int currentBalance = memberMapper.getBalance(id);
	        if (currentBalance < price) {
	            return false;
	        }
	        return memberMapper.updateBalance(id, -price) > 0;
	    }

	    public boolean updateProfileImage(String id, String imageUrl) {
	        return memberMapper.updateProfileImg(id, imageUrl) > 0;
	    }

	    public boolean deleteMember(String id) {
	    	return memberMapper.deleteMember(id) >0;
	    }

	    public Member selectMemberById(String id) {
	        return memberMapper.selectMemberById(id);
	    }

	    public List<Member> searchMembers(String keyword) {
	        return memberMapper.searchMembers(keyword);
	    }
}
