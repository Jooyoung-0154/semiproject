package org.cloud.service;

import java.util.List;

import org.cloud.dto.Member;
import org.cloud.exception.ConflictException;
import org.cloud.exception.ResourceNotFoundException;
import org.cloud.mapper.MemberMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

// BCrypt 적용 이후 DB에 있는 기존 평문 비밀번호는 로그인 불가.
// 기존 테스트 계정은 비밀번호를 재설정하거나 DB에서 직접 BCrypt 해시로 교체 필요.
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberMapper memberMapper;

    private final PasswordEncoder passwordEncoder;

    public String register(Member member) {
        if (memberMapper.checkId(member.getId()) > 0) {
            throw new ConflictException("이미 존재하는 아이디입니다.");
        }
        if (memberMapper.checkNickname(member.getNickname()) > 0) {
            throw new ConflictException("이미 존재하는 닉네임입니다.");
        }

        member.setPassword(passwordEncoder.encode(member.getPassword()));
        int result = memberMapper.insertMember(member);
        if (result == 0) {
            throw new IllegalStateException("회원 등록에 실패했습니다.");
        }
        return "회원 등록 완료";
    }

    public boolean updateNickname(String id, String newNickname) {
        if (newNickname == null || newNickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        if (memberMapper.checkNickname(newNickname) > 0) {
            throw new ConflictException("이미 존재하는 닉네임입니다.");
        }
        if (memberMapper.updateNickname(id, newNickname) == 0) {
            throw new IllegalStateException("닉네임 변경에 실패했습니다.");
        }
        return true;
    }

    public boolean login(String id, String password) {
        Member member = memberMapper.selectMemberById(id);
        return member != null && passwordEncoder.matches(password, member.getPassword());
    }

    public boolean updatePassword(String id, String oldPw, String newPw) {
        if (oldPw == null || oldPw.isBlank() || newPw == null || newPw.isBlank()) {
            throw new IllegalArgumentException("기존 비밀번호와 새 비밀번호를 입력해주세요.");
        }

        Member member = memberMapper.selectMemberById(id);
        if (member == null) {
            throw new ResourceNotFoundException("회원을 찾을 수 없습니다.");
        }
        if (!passwordEncoder.matches(oldPw, member.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호가 일치하지 않습니다.");
        }

        String encodedPassword = passwordEncoder.encode(newPw);
        if (memberMapper.updatePassword(id, encodedPassword) == 0) {
            throw new IllegalStateException("비밀번호 변경에 실패했습니다.");
        }
        return true;
    }

    public boolean updateProfileImage(String id, String imageUrl) {
        if (memberMapper.updateProfileImg(id, imageUrl) == 0) {
            throw new IllegalStateException("프로필 이미지 변경에 실패했습니다.");
        }
        return true;
    }

    @Transactional
    public boolean deleteMember(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("회원 아이디가 필요합니다.");
        }

        // 탈퇴 회원이 작성한 게시글은 화면에 남기지 않도록 함께 삭제한다.
        // FK 제약 때문에 좋아요 -> 댓글 -> 게시글 순서로 삭제한다.
        memberMapper.deletePostLikesByWriterId(id);
        memberMapper.deletePostCommentsByWriterId(id);
        memberMapper.deletePostsByWriterId(id);

        // 탈퇴 회원이 다른 게시글에 남긴 댓글/좋아요도 정리한다.
        memberMapper.deletePostLikesByUserId(id);
        memberMapper.deletePostCommentsByUserId(id);

        if (memberMapper.deleteMember(id) == 0) {
            throw new IllegalStateException("회원 탈퇴에 실패했습니다.");
        }
        return true;
    }

    public Member selectMemberById(String id) {
        return memberMapper.selectMemberById(id);
    }

    public List<Member> searchMembers(String keyword) {
        return memberMapper.searchMembers(keyword);
    }

    public boolean updateIntro(String id, String intro) {
        if (memberMapper.updateIntro(id, intro) == 0) {
            throw new IllegalStateException("소개 변경에 실패했습니다.");
        }
        return true;
    }

    public boolean updateScrapPublic(String id, boolean scrapPublic) {
        if (memberMapper.updateScrapPublic(id, scrapPublic) == 0) {
            throw new IllegalStateException("스크랩 공개 설정 변경에 실패했습니다.");
        }
        return true;
    }

    public boolean updateSnsSocial(String id, String youtube, String instagram, String facebook) {
        Member m = new Member();
        m.setId(id);
        m.setSnsYoutube(youtube);
        m.setSnsInstagram(instagram);
        m.setSnsFacebook(facebook);
        if (memberMapper.updateSnsSocial(m) == 0) {
            throw new IllegalStateException("SNS 정보 변경에 실패했습니다.");
        }
        return true;
    }
}
