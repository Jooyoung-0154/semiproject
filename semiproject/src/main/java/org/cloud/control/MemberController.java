package org.cloud.control;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.cloud.dto.Member;
import org.cloud.service.MemberService;
import org.cloud.service.RecipeService;
import org.cloud.storage.FileStorageService;
import org.cloud.storage.ImageType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/member")
public class MemberController {

    private final RecipeService recipeService;
    private final MemberService memberService;
    private final FileStorageService fileStorageService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    public MemberController(
            RecipeService recipeService,
            MemberService memberService,
            FileStorageService fileStorageService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository) {
        this.recipeService = recipeService;
        this.memberService = memberService;
        this.fileStorageService = fileStorageService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
    }

    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Member member) {
        
    	String resultMessage = memberService.register(member);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", resultMessage);
        
        if ("회원 등록 완료".equals(resultMessage)) {
            response.put("success", true);
            return ResponseEntity.ok(response);
        } else {
            
            response.put("success", false);
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/me/profile-image")
    public ResponseEntity<String> updateProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        try {
            String webPath = fileStorageService.save(file, ImageType.PROFILE);
            boolean success = memberService.updateProfileImage(authentication.getName(), webPath);
            
            return success ? ResponseEntity.ok(webPath) : ResponseEntity.status(500).body("DB 업데이트 실패");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("이미지 저장 중 오류: " + e.getMessage());
        }
    }

    @PutMapping("/me/nickname")
    public boolean updateNickname(Authentication authentication, @RequestParam String newNickname) {
        return memberService.updateNickname(authentication.getName(), newNickname);
    }

    @PutMapping("/me/password")
    public boolean updatePassword(Authentication authentication,
                                  @RequestParam String oldPw, 
                                  @RequestParam String newPw) {
        return memberService.updatePassword(authentication.getName(), oldPw, newPw);
    }

    @DeleteMapping("/me")
    public boolean deleteMember(Authentication authentication) {
        return memberService.deleteMember(authentication.getName());
    }

    @GetMapping("/search")
    public List<Member> searchMembers(@RequestParam String keyword) {
        return memberService.searchMembers(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable String id) {
        
        Member member = memberService.selectMemberById(id);
        
        if (member == null) {
            return ResponseEntity.notFound().build(); 
        }
        member.setRecipeCount(recipeService.getRecipesCountByWriterId(id));
        
        return ResponseEntity.ok(member);
    }
    
    // 멤버 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Member member,
            HttpServletRequest request,
            HttpServletResponse httpResponse) {
        Map<String, Object> response = new HashMap<>();

        try {
            Authentication authenticationRequest =
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            member.getId(), member.getPassword());
            Authentication authentication =
                    authenticationManager.authenticate(authenticationRequest);

            SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
            securityContext.setAuthentication(authentication);
            SecurityContextHolder.setContext(securityContext);
            securityContextRepository.saveContext(securityContext, request, httpResponse);

            request.getSession().setAttribute("userId", authentication.getName());
            response.put("success", true);
            response.put("message", "로그인 성공");
            Member loginUser = memberService.selectMemberById(authentication.getName());
            response.put("user", loginUser);
            return ResponseEntity.ok(response);
        } catch (AuthenticationException exception) {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<Member> getCurrentMember(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return ResponseEntity.status(401).build();
        }

        Member member = memberService.selectMemberById(authentication.getName());
        if (member == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(member);
    }
    
    @PutMapping("/me/intro")
    public boolean updateIntro(Authentication authentication, @RequestParam String intro) {
        return memberService.updateIntro(authentication.getName(), intro);
    }

    @PutMapping("/me/scrap-public")
    public boolean updateScrapPublic(Authentication authentication, @RequestParam boolean scrapPublic) {
        return memberService.updateScrapPublic(authentication.getName(), scrapPublic);
    }

    @PutMapping("/me/sns")
    public boolean updateSnsSocial(
            Authentication authentication,
            @RequestParam(required = false) String youtube,
            @RequestParam(required = false) String instagram,
            @RequestParam(required = false) String facebook) {
        return memberService.updateSnsSocial(
                authentication.getName(), youtube, instagram, facebook);
    }
}
