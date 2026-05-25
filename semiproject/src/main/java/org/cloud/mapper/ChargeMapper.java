package org.cloud.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.cloud.dto.Charge;

@Mapper
public interface ChargeMapper {

    int insertCharge(Charge charge);

    List<Charge> getChargeListByUserId(String USER_ID);

    int deleteCharge(int CHARGE_ID);
}