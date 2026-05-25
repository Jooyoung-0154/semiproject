package org.cloud.dto;

import lombok.Data;

@Data
public class Purchase {
    private int purchaseId;      // 결제 번호
    private String userId;       // 구매자
    private String recipeCode;   // 구매한 레시피
    private int purchasePrice;   // ★ 결제 당시의 가격 (중요!)
    private String purchaseDate; // 구매 일시
}