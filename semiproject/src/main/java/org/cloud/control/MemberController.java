package org.cloud.control;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import java.util.List;

import org.cloud.dto.Member;
import org.cloud.service.MemberService;
import org.cloud.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @Autowired
    private MemberService memberService;


    MemberController(RecipeService recipeService) {
        this.recipeService = recipeService;
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

    @PostMapping("/{id}/profile-image")
    public ResponseEntity<String> updateProfileImage(@PathVariable String id, 
                                                     @RequestParam("file") MultipartFile file) {
        try {
            String projectPath = System.getProperty("user.dir");
            String uploadDir = projectPath + "/src/main/resources/static/image/";
            
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String savedName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            

            file.transferTo(new File(uploadDir + savedName));

            String webPath = "/image/" + savedName;
            boolean success = memberService.updateProfileImage(id, webPath);
            
            return success ? ResponseEntity.ok(webPath) : ResponseEntity.status(500).body("DB 업데이트 실패");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("이미지 저장 중 오류: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/balance")
    public int getBalance(@PathVariable String id) {
        return memberService.checkBalance(id);
    }

    @PutMapping("/{id}/nickname")
    public boolean updateNickname(@PathVariable String id, @RequestParam String newNickname) {
        return memberService.updateNickname(id, newNickname);
    }

    @PutMapping("/{id}/password")
    public boolean updatePassword(@PathVariable String id, 
                                  @RequestParam String oldPw, 
                                  @RequestParam String newPw) {
        return memberService.updatePassword(id, oldPw, newPw);
    }

    @PostMapping("/{id}/balance/charge")
    public boolean chargeBalance(@PathVariable String id, @RequestParam int amount) {
        return memberService.chargeBalance(id, amount);
    }

    @PostMapping("/{id}/purchase")
    public boolean purchase(@PathVariable String id, @RequestParam int price) {
        return memberService.processPurchase(id, price);
    }

    @DeleteMapping("/{id}")
    public boolean deleteMember(@PathVariable String id) {
        return memberService.deleteMember(id);
    }

    @GetMapping("/search")
    public List<Member> searchMembers(@RequestParam String keyword) {
        return memberService.searchMembers(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable("id") String id) {
        
        Member member = memberService.selectMemberById(id);
        
        if (member == null) {
            return ResponseEntity.notFound().build(); 
        }
        member.setRecipeCount(recipeService.getRecipesCountByWriterId(id));
        
        return ResponseEntity.ok(member);
    }
    // 멤버 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Member member) {
        boolean loginSuccess = memberService.login(member.getId(), member.getPassword());
        
        Map<String, Object> response = new HashMap<>();
        if (loginSuccess) {
            response.put("success", true);
            response.put("message", "로그인 성공");
            Member loginUser = memberService.selectMemberById(member.getId());
            response.put("user", loginUser);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "아이디 또는 비밀번호가 일치하지 않습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
