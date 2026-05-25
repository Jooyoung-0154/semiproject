package org.cloud.service;

import java.util.List;

import org.cloud.dto.Purchase;
import org.cloud.mapper.PurchaseMapper;
import org.cloud.mapper.ShoppingListMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseMapper purchaseMapper;
    
    @Autowired
    private ShoppingListMapper shoppingListMapper; // 장바구니 삭제를 위해 주입

    @Transactional
    public boolean processPurchase(Purchase purchase, int cartId) {
        // 1. 구매 내역 기록
        int result = purchaseMapper.insertPurchase(purchase);
        
        if (result > 0) {
            // 2. 구매에 성공했다면 장바구니에서 해당 항목 삭제
            // (cartId가 전달된 경우에만 삭제)
            if (cartId > 0) {
                shoppingListMapper.deleteCart(cartId);
            }
            return true;
        }
        return false;
    }

    public boolean isRecipePurchased(String userId, String recipeCode) {
        Purchase p = new Purchase();
        p.setUserId(userId);
        p.setRecipeCode(recipeCode);
        return purchaseMapper.checkPurchaseExist(p) > 0;
    }

    public List<Purchase> getMyPurchaseHistory(String userId) {
        return purchaseMapper.getPurchaseListByUserId(userId);
    }
}