package org.cloud.dto;

import lombok.Data;

@Data
public class Guestbook {
	private int guestbookId;
	private String hostId;
	private String writerId;
	private String content;
	private String regDate;
	private String writerNickname;

	public int getGuestbookId() {
		return guestbookId;
	}

	public void setGuestbookId(int guestbookId) {
		this.guestbookId = guestbookId;
	}

	public String getHostId() {
		return hostId;
	}

	public void setHostId(String hostId) {
		this.hostId = hostId;
	}

	public String getWriterId() {
		return writerId;
	}

	public void setWriterId(String writerId) {
		this.writerId = writerId;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getRegDate() {
		return regDate;
	}

	public void setRegDate(String regDate) {
		this.regDate = regDate;
	}

	public String getWriterNickname() {
		return writerNickname;
	}

	public void setWriterNickname(String writerNickname) {
		this.writerNickname = writerNickname;
	}

}