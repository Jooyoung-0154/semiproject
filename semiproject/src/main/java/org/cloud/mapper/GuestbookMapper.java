package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.Guestbook;
import java.util.List;

@Mapper
public interface GuestbookMapper {

    int insertGuestbook(Guestbook guestbook);

    int updateGuestbook(Guestbook guestbook);

    int deleteGuestbook(int GUESTBOOK_ID);

    // 4. 특정 주인의 방명록 목록 조회 (페이징 포함)
    List<Guestbook> getGuestbookList(@Param("HOST_ID") String HOST_ID, 
                                     @Param("offset") int offset, 
                                     @Param("limit") int limit);

    int getTotalCount(String HOST_ID);
}
