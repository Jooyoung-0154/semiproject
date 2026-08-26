package org.cloud.security;

import org.cloud.dto.Member;
import org.cloud.mapper.MemberMapper;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberMapper memberMapper;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Member member = memberMapper.selectMemberById(username);

        if (member == null) {
            throw new UsernameNotFoundException("회원을 찾을 수 없습니다.");
        }

        return User.withUsername(member.getId())
                .password(member.getPassword())
                .roles(member.getRole())
                .build();
    }
}
