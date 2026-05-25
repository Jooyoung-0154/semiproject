package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.ShoppingList;
import java.util.List;

@Mapper
public interface ShoppingListMapper {
    // 1. 장바구니 담기
    int insertCart(ShoppingList shoppingList);

    // 2. 장바구니에서 삭제
    int deleteCart(int CART_ID);

    // 3. 내 장바구니 목록 조회
    List<ShoppingList> getCartListByUserId(String USER_ID);

    // 4. 이미 담긴 레시피인지 확인 (중복 방지용)
    int checkCartExist(ShoppingList shoppingList);
}