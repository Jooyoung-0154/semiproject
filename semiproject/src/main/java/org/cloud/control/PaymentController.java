package org.cloud.control;

import java.util.List;

import org.cloud.dto.Charge;
import org.cloud.service.ChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private ChargeService chargeService;

    @PostMapping("/charge")
    public boolean charge(@RequestBody Charge charge) {
        return chargeService.processCharge(charge);
    }

    @GetMapping("/history/{userId}")
    public List<Charge> getHistory(@PathVariable String userId) {
        return chargeService.getUserChargeHistory(userId);
    }
    
    @DeleteMapping("/history/{chargeId}")
    public boolean deleteHistory(@PathVariable int chargeId) {
        // 서비스의 removeChargeHistory 메서드를 호출하여 결과를 리턴합니다.
        return chargeService.removeChargeHistory(chargeId);
    }
}