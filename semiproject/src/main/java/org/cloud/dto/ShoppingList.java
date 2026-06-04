package org.cloud.dto;

import lombok.Data;

@Data
public class ShoppingList {
	private int cartId; // 장바구니 고유 번호
	private String userId; // 누구의 장바구니인가
	private String recipeCode; // 담은 레시피 번호
	private String addDate; // 담은 날짜

	public int getCartId() {
		return cartId;
	}

	public void setCartId(int cartId) {
		this.cartId = cartId;
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

	public String getAddDate() {
		return addDate;
	}

	public void setAddDate(String addDate) {
		this.addDate = addDate;
	}

}