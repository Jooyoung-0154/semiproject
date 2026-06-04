package org.cloud.dto;

import lombok.Data;

@Data
public class Charge {
	private int chargeId; // 충전 번호
	private String userId; // 충전한 유저
	private int amount; // 충전 금액
	private String chargeMethod; // 충전 수단 (예: CARD, CASH, PAY)
	private String chargeDate; // 충전 일시

	public int getChargeId() {
		return chargeId;
	}

	public void setChargeId(int chargeId) {
		this.chargeId = chargeId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public int getAmount() {
		return amount;
	}

	public void setAmount(int amount) {
		this.amount = amount;
	}

	public String getChargeMethod() {
		return chargeMethod;
	}

	public void setChargeMethod(String chargeMethod) {
		this.chargeMethod = chargeMethod;
	}

	public String getChargeDate() {
		return chargeDate;
	}

	public void setChargeDate(String chargeDate) {
		this.chargeDate = chargeDate;
	}

}