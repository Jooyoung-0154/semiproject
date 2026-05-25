package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.Purchase;
import java.util.List;

@Mapper
public interface PurchaseMapper {
    
    int insertPurchase(Purchase purchase);

    List<Purchase> getPurchaseListByUserId(String USER_ID);

    int checkPurchaseExist(Purchase purchase);
}