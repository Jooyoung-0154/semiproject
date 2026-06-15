package org.cloud.service;

import java.util.List;

import org.cloud.dto.Member;
import org.cloud.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// BCrypt 적용 이후 DB에 있는 기존 평문 비밀번호는 로그인 불가.
// 기존 테스트 계정은 비밀번호를 재설정하거나 DB에서 직접 BCrypt 해시로 교체 필요.
@Service
public class MemberService {

    @Autowired
    private MemberMapper memberMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(Member member) {
        if (memberMapper.checkId(member.getId()) > 0) {
            return "이미 존재하는 아이디입니다.";
        }
        if (memberMapper.checkNickname(member.getNickname()) > 0) {
            return "이미 존재하는 닉네임입니다.";
        }

        member.setPassword(passwordEncoder.encode(member.getPassword()));
        int result = memberMapper.insertMember(member);
        return result > 0 ? "회원 등록 완료" : "회원 등록 실패";
    }

    public boolean updateNickname(String id, String newNickname) {
        if (memberMapper.checkNickname(newNickname) > 0) {
            return false;
        }
        return memberMapper.updateNickname(id, newNickname) > 0;
    }

    public boolean login(String id, String password) {
        Member member = memberMapper.selectMemberById(id);
        return member != null && passwordEncoder.matches(password, member.getPassword());
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

    @Transactional
    public boolean deleteMember(String id) {
        if (id == null || id.isBlank()) {
            return false;
        }

        // 탈퇴 회원이 작성한 게시글은 화면에 남기지 않도록 함께 삭제한다.
        // FK 제약 때문에 좋아요 -> 댓글 -> 게시글 순서로 삭제한다.
        memberMapper.deletePostLikesByWriterId(id);
        memberMapper.deletePostCommentsByWriterId(id);
        memberMapper.deletePostsByWriterId(id);

        // 탈퇴 회원이 다른 게시글에 남긴 댓글/좋아요도 정리한다.
        memberMapper.deletePostLikesByUserId(id);
        memberMapper.deletePostCommentsByUserId(id);

        return memberMapper.deleteMember(id) > 0;
    }

    public Member selectMemberById(String id) {
        return memberMapper.selectMemberById(id);
    }

    public List<Member> searchMembers(String keyword) {
        return memberMapper.searchMembers(keyword);
    }

    public boolean updateIntro(String id, String intro) {
        return memberMapper.updateIntro(id, intro) > 0;
    }

    public boolean updateScrapPublic(String id, boolean scrapPublic) {
        return memberMapper.updateScrapPublic(id, scrapPublic) > 0;
    }

    public boolean updateSnsSocial(String id, String youtube, String instagram, String facebook) {
        Member m = new Member();
        m.setId(id);
        m.setSnsYoutube(youtube);
        m.setSnsInstagram(instagram);
        m.setSnsFacebook(facebook);
        return memberMapper.updateSnsSocial(m) > 0;
    }
}
