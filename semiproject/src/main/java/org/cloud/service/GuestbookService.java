<<<<<<< HEAD
package org.cloud.service;

import java.util.List;

import org.cloud.dto.Guestbook;
import org.cloud.mapper.GuestbookMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GuestbookService {

    @Autowired
    private GuestbookMapper guestbookMapper;

    @Autowired
    private NotificationService notificationService;

    public boolean writeGuestbook(Guestbook guestbook) {
        boolean result = guestbookMapper.insertGuestbook(guestbook) > 0;

        if (result) {
            try {
                notificationService.createNotification(
                        guestbook.getHostId(),
                        guestbook.getWriterId(),
                        "GUESTBOOK",
                        String.valueOf(guestbook.getGuestbookId()),
                        guestbook.getWriterId() + "님이 방명록을 남겼습니다."
                );
            } catch (Exception e) {
                System.out.println("방명록 알림 저장 실패: " + e.getMessage());
            }
        }
        return result;
    }

    public boolean modifyGuestbook(Guestbook guestbook) {
        return guestbookMapper.updateGuestbook(guestbook) > 0;
    }

    public boolean removeGuestbook(int guestbookId, String accessId, String writerId, String hostId) {
        if (accessId != null && (accessId.equals(writerId) || accessId.equals(hostId))) {
            return guestbookMapper.deleteGuestbook(guestbookId) > 0;
        }
        return false;
    }

    public List<Guestbook> getGuestbookPage(String hostId, int page) {
        int pageSize = 5;
        int offset = (page - 1) * pageSize;
        return guestbookMapper.getGuestbookList(hostId, offset, pageSize);
    }

    public int getTotalGuestbookCount(String hostId) {
        return guestbookMapper.getTotalCount(hostId);
    }
}
=======
package org.cloud.service;

import java.util.List;

import org.cloud.dto.Guestbook;
import org.cloud.mapper.GuestbookMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GuestbookService {

    private static final int PAGE_SIZE = 5;

    @Autowired
    private GuestbookMapper guestbookMapper;

    // 작성
    public boolean writeGuestbook(Guestbook guestbook) {
        return guestbookMapper.insertGuestbook(guestbook) > 0;
    }

    // 수정 (작성자 확인 로직은 보통 컨트롤러나 서비스에서 수행)
    public boolean modifyGuestbook(Guestbook guestbook) {
        return guestbookMapper.updateGuestbook(guestbook) > 0;
    }
    
    
    public boolean removeGuestbook(int guestbookId, String accessId, String writerId, String hostId) {
        // 작성자 본인이거나, 방명록 주인인 경우에만 삭제 허용
        if (accessId.equals(writerId) || accessId.equals(hostId)) {
            return guestbookMapper.deleteGuestbook(guestbookId) > 0;
        }
        return false;
    }

    /**
     * 페이징 처리된 목록 조회
     * @param hostId 방명록 주인
     * @param page 현재 페이지 번호 (1, 2, 3...)
     * @param pageSize 한 페이지에 보여줄 개수
     */
    public List<Guestbook> getGuestbookPage(String hostId, int page) {
        int offset = (page - 1) * PAGE_SIZE;
        return guestbookMapper.getGuestbookList(hostId, offset, PAGE_SIZE);
    }
    
    // 전체 개수 (프론트에서 페이지 번호를 그릴 때 필요)
    public int getTotalGuestbookCount(String hostId) {
        return guestbookMapper.getTotalCount(hostId);
    }
}
>>>>>>> 5ee042261809b2e907799f6894e7460b59020a81
