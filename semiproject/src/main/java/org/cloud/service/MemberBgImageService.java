package org.cloud.service;

import java.util.List;

import org.cloud.dto.MemberBgImage;
import org.cloud.mapper.MemberBgImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberBgImageService {

    @Autowired
    private MemberBgImageMapper memberBgImageMapper;

    @Transactional
    public void addBgImage(MemberBgImage bgImage) {
        memberBgImageMapper.insertBgImage(bgImage);
    }

    public List<MemberBgImage> getBgImages(String memberId) {
        return memberBgImageMapper.getBgImagesByMemberId(memberId);
    }

    @Transactional
    public void deleteBgImage(int bgImgId) {
        memberBgImageMapper.deleteBgImageById(bgImgId);
    }

    @Transactional
    public void updateSortOrders(List<MemberBgImage> bgImages) {
        for (MemberBgImage img : bgImages) {
            memberBgImageMapper.updateSortOrder(img);
        }
    }
}
