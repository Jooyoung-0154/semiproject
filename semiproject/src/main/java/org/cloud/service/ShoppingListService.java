package org.cloud.service;

import java.util.List;

import org.cloud.dto.ShoppingList;
import org.cloud.mapper.ShoppingListMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ShoppingListService {

    @Autowired
    private ShoppingListMapper shoppingListMapper;

    public String addRecipeToCart(ShoppingList shoppingList) {
        // 이미 담겨 있는지 확인
        if (shoppingListMapper.checkCartExist(shoppingList) > 0) {
            return "ALREADY_EXIST"; // 이미 담긴 경우
        }
        
        // 장바구니 등록
        boolean success = shoppingListMapper.insertCart(shoppingList) > 0;
        return success ? "SUCCESS" : "FAIL";
    }

    public List<ShoppingList> getMyShoppingList(String userId) {
        return shoppingListMapper.getCartListByUserId(userId);
    }

    public boolean removeRecipeFromCart(int cartId) {
        return shoppingListMapper.deleteCart(cartId) > 0;
    }
}