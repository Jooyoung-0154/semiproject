package org.cloud.dto;

import lombok.Data;

@Data
public class Purchase {
	private int purchaseId; // 결제 번호
	private String userId; // 구매자
	private String recipeCode; // 구매한 레시피
	private int purchasePrice; // ★ 결제 당시의 가격 (중요!)
	private String purchaseDate; // 구매 일시

	public int getPurchaseId() {
		return purchaseId;
	}

	public void setPurchaseId(int purchaseId) {
		this.purchaseId = purchaseId;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getRecipeCode() {
		return recipeCode;
	}

	public void setRecipeCode(String recipeCode) {
		this.recipeCode = recipeCode;
	}

	public int getPurchasePrice() {
		return purchasePrice;
	}

	public void setPurchasePrice(int purchasePrice) {
		this.purchasePrice = purchasePrice;
	}

	public String getPurchaseDate() {
		return purchaseDate;
	}

	public void setPurchaseDate(String purchaseDate) {
		this.purchaseDate = purchaseDate;
	}

}