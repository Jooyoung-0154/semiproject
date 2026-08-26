package org.cloud.control;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.cloud.dto.Member;
import org.cloud.service.MemberService;
import org.cloud.service.RecipeService;
import org.cloud.storage.FileStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

class MemberControllerSecurityTest {

    private final RecipeService recipeService = mock(RecipeService.class);
    private final MemberService memberService = mock(MemberService.class);
    private final FileStorageService fileStorageService = mock(FileStorageService.class);
    private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
    private final SecurityContextRepository securityContextRepository =
            mock(SecurityContextRepository.class);

    private MemberController memberController;

    @BeforeEach
    void setUp() {
        memberController = new MemberController(
                recipeService,
                memberService,
                fileStorageService,
                authenticationManager,
                securityContextRepository);
    }

    @AfterEach
    void clearSecurityContext() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
    }

    @Test
    void loginSavesAuthenticationInSecurityContextAndSession() {
        Member loginRequest = new Member();
        loginRequest.setId("member1");
        loginRequest.setPassword("plain-password");

        Member loginUser = new Member();
        loginUser.setId("member1");
        loginUser.setNickname("회원1");

        Authentication authenticated = UsernamePasswordAuthenticationToken.authenticated(
                "member1",
                null,
                java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenReturn(authenticated);
        when(memberService.selectMemberById("member1")).thenReturn(loginUser);

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<?> result = memberController.login(loginRequest, request, response);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseBody(result))
                .containsEntry("success", true)
                .containsEntry("user", loginUser);
        assertThat(request.getSession().getAttribute("userId")).isEqualTo("member1");

        ArgumentCaptor<Authentication> authenticationCaptor =
                ArgumentCaptor.forClass(Authentication.class);
        verify(authenticationManager).authenticate(authenticationCaptor.capture());
        assertThat(authenticationCaptor.getValue().getName()).isEqualTo("member1");
        assertThat(authenticationCaptor.getValue().getCredentials())
                .isEqualTo("plain-password");

        ArgumentCaptor<SecurityContext> contextCaptor =
                ArgumentCaptor.forClass(SecurityContext.class);
        verify(securityContextRepository)
                .saveContext(contextCaptor.capture(), eq(request), eq(response));
        assertThat(contextCaptor.getValue().getAuthentication()).isSameAs(authenticated);
    }

    @Test
    void loginFailureDoesNotSaveSecurityContextOrCreateSession() {
        Member loginRequest = new Member();
        loginRequest.setId("member1");
        loginRequest.setPassword("wrong-password");
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<?> result = memberController.login(loginRequest, request, response);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(responseBody(result)).containsEntry("success", false);
        assertThat(request.getSession(false)).isNull();
        verify(securityContextRepository, never())
                .saveContext(any(), any(), any());
    }

    @Test
    void logoutInvalidatesSessionAndClearsSecurityContext() {
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                "member1",
                null,
                java.util.List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession().setAttribute("userId", "member1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<Void> result =
                memberController.logout(request, response, authentication);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(request.getSession(false)).isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void currentMemberIsLoadedFromAuthenticationName() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("member1");

        Member currentMember = new Member();
        currentMember.setId("member1");
        currentMember.setNickname("회원1");
        when(memberService.selectMemberById("member1")).thenReturn(currentMember);

        ResponseEntity<Member> result = memberController.getCurrentMember(authentication);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isSameAs(currentMember);
        verify(memberService).selectMemberById("member1");
    }

    @Test
    void currentMemberRejectsMissingAuthentication() {
        ResponseEntity<Member> result = memberController.getCurrentMember(null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(memberService, never()).selectMemberById(any());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> responseBody(ResponseEntity<?> response) {
        assertThat(response.getBody()).isInstanceOf(Map.class);
        return (Map<String, Object>) response.getBody();
    }
}
