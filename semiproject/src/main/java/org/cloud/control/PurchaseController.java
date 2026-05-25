package org.cloud.control;

import org.cloud.dto.Purchase;
import org.cloud.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipe")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;


    // 2. 내 구매 내역 조회
    @GetMapping("/purchase/my/{userId}")
    public List<Purchase> getMyHistory(@PathVariable String userId) {
        return purchaseService.getMyPurchaseHistory(userId);
    }

    // 3. 특정 레시피 구매 여부 확인 (isRecipePurchased 사용)
    // 프론트엔드에서 '구매한 사람만 레시피 보기' 기능을 만들 때 유용해요!
    @GetMapping("/purchase/check")
    public boolean checkPurchased(@RequestParam String userId, @RequestParam String recipeCode) {
        return purchaseService.isRecipePurchased(userId, recipeCode);
    }
}