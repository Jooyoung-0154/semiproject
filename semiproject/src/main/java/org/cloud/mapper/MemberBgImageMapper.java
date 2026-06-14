package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.MemberBgImage;

@Mapper
public interface MemberBgImageMapper {

    int insertBgImage(MemberBgImage bgImage);

    List<MemberBgImage> getBgImagesByMemberId(String memberId);

    int deleteBgImageById(int bgImgId);

    int deleteAllBgImagesByMemberId(String memberId);

    int updateSortOrder(MemberBgImage bgImage);
}
