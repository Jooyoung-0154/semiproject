package org.cloud.dto;

import lombok.Data;

@Data
public class Charge {
    private int chargeId;        // 충전 번호
    private String userId;       // 충전한 유저
    private int amount;           // 충전 금액
    private String chargeMethod; // 충전 수단 (예: CARD, CASH, PAY)
    private String chargeDate;   // 충전 일시
}