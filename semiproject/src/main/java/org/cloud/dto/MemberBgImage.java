package org.cloud.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberBgImage {
    private int bgImgId;
    private String memberId;
    private String imgUrl;
    private int sortOrder;
}
