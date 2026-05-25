package org.cloud.dto;

import lombok.Data;

@Data
public class ShoppingList {
    private int cartId;          // 장바구니 고유 번호
    private String userId;       // 누구의 장바구니인가
    private String recipeCode;   // 담은 레시피 번호
    private String addDate;      // 담은 날짜
}