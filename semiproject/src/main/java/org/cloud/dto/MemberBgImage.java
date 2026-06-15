package org.cloud.dto;

import lombok.Data;

@Data
public class MemberBgImage {
    private int bgImgId;
    private String memberId;
    private String imgUrl;
    private int sortOrder;
    private Integer posX;
    private Integer posY;
    private Integer bgSize;
}
