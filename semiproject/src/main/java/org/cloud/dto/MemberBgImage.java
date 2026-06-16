package org.cloud.dto;

import lombok.Data;

@Data
public class MemberBgImage {
    private int bgImgId;
    private String memberId;
    private String imgUrl;
    private int sortOrder;
	public int getBgImgId() {
		return bgImgId;
	}
	public void setBgImgId(int bgImgId) {
		this.bgImgId = bgImgId;
	}
	public String getMemberId() {
		return memberId;
	}
	public void setMemberId(String memberId) {
		this.memberId = memberId;
	}
	public String getImgUrl() {
		return imgUrl;
	}
	public void setImgUrl(String imgUrl) {
		this.imgUrl = imgUrl;
	}
	public int getSortOrder() {
		return sortOrder;
	}
	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}
    
}
