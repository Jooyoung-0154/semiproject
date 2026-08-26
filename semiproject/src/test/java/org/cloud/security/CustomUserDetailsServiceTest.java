package org.cloud.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.cloud.dto.Member;
import org.cloud.mapper.MemberMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private MemberMapper memberMapper;

    private CustomUserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = new CustomUserDetailsService(memberMapper);
    }

    @Test
    void activeMemberIsConvertedToUserDetails() {
        Member member = new Member();
        member.setId("member1");
        member.setPassword("encoded-password");
        member.setRole("USER");
        when(memberMapper.selectMemberById("member1")).thenReturn(member);

        UserDetails userDetails = userDetailsService.loadUserByUsername("member1");

        assertThat(userDetails.getUsername()).isEqualTo("member1");
        assertThat(userDetails.getPassword()).isEqualTo("encoded-password");
        assertThat(userDetails.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
        verify(memberMapper).selectMemberById("member1");
    }

    @Test
    void missingOrInactiveMemberThrowsUsernameNotFoundException() {
        when(memberMapper.selectMemberById("missing")).thenReturn(null);

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("missing"))
                .isInstanceOf(UsernameNotFoundException.class);

        verify(memberMapper).selectMemberById("missing");
    }
}
