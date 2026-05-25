package org.cloud.control;

import java.util.List;

import org.cloud.dto.ShoppingList;
import org.cloud.service.ShoppingListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class ShoppinglistController {

    @Autowired
    private ShoppingListService shoppingListService;

    // 1. 장바구니 담기
    @PostMapping("/add")
    public String addToCart(@RequestBody ShoppingList shoppingList) {
        // 서비스에서 보낸 "SUCCESS", "ALREADY_EXIST", "FAIL" 문자열이 그대로 리턴됩니다.
        return shoppingListService.addRecipeToCart(shoppingList);
    }

    // 2. 내 장바구니 목록 조회
    @GetMapping("/{userId}")
    public List<ShoppingList> getMyCart(@PathVariable String userId) {
        return shoppingListService.getMyShoppingList(userId);
    }

    // 3. 장바구니 아이템 삭제
    @DeleteMapping("/{cartId}")
    public boolean removeCart(@PathVariable int cartId) {
        return shoppingListService.removeRecipeFromCart(cartId);
    }
}