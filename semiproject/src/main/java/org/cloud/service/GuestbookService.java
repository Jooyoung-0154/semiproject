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
