package org.cloud.control;

import java.util.HashMap;
import java.util.Map;

import org.cloud.dto.Guestbook;
import org.cloud.service.GuestbookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/guestbook") // 방명록 관련 요청은 모두 이 주소로 시작해요.
public class GuestbookController {

    @Autowired
    private GuestbookService guestbookService;

    // 1. 방명록 작성
    @PostMapping("")
    public boolean write(@RequestBody Guestbook guestbook) {
        return guestbookService.writeGuestbook(guestbook);
    }

    // 2. 방명록 수정
    @PutMapping("")
    public boolean modify(@RequestBody Guestbook guestbook) {
        return guestbookService.modifyGuestbook(guestbook);
    }

    // 3. 방명록 삭제
    @DeleteMapping("/{guestbookId}")
    public boolean remove(
            @PathVariable("guestbookId") int guestbookId,
            @RequestParam("accessId") String accessId,
            @RequestParam("writerId") String writerId,
            @RequestParam("hostId") String hostId) {
        
        return guestbookService.removeGuestbook(guestbookId, accessId, writerId, hostId);
    }

    // 4. 방명록 목록 조회 (Get + 페이징)
    @GetMapping("/{hostId}")
    public Map<String, Object> getList(
            @PathVariable("hostId") String hostId,
            @RequestParam(value = "page", defaultValue = "1") int page) {
        
        Map<String, Object> response = new HashMap<>();
        
        response.put("list", guestbookService.getGuestbookPage(hostId, page));
        response.put("totalCount", guestbookService.getTotalGuestbookCount(hostId));
        
        return response;
    }
}
