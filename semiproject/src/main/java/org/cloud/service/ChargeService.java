package org.cloud.service;

import java.util.List;

import org.cloud.dto.Charge;
import org.cloud.mapper.ChargeMapper;
import org.cloud.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChargeService {

    @Autowired
    private ChargeMapper chargeMapper;

    @Autowired
    private MemberMapper memberMapper;

    @Transactional
    public boolean processCharge(Charge charge) {
        int result = chargeMapper.insertCharge(charge);
        
        if (result > 0) {
            return memberMapper.updateBalance(charge.getUserId(), charge.getAmount()) > 0;
        }
        
        return false;
    }

    public List<Charge> getUserChargeHistory(String userId) {
        return chargeMapper.getChargeListByUserId(userId);
    }

    public boolean removeChargeHistory(int chargeId) {
        return chargeMapper.deleteCharge(chargeId) > 0;
    }
}
