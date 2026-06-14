package org.cloud.control;


import org.cloud.service.RecipeBatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private RecipeBatchService recipeBatchService;

    // 공공 데이터 동기화 시작 (관리자만 호출한다고 가정)
    @GetMapping("/batch-init")
    public String startBatch() {
        recipeBatchService.initBatch();
    	return "데이터 동기화 로직이 실행되었습니다. 서버 로그를 확인하세요!";
    }
}