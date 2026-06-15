package org.cloud.service;

import java.util.ArrayList;
import java.util.List;

import org.cloud.dto.Cooking_Info;
import org.cloud.dto.Irdnt_Info;
import org.cloud.dto.Recipe;
import org.cloud.dto.Recipe_Info;
import org.cloud.mapper.CookingMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class RecipeBatchService {

    @Autowired
    private CookingMapper cookingMapper;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${api.recipe.key}")//properties에 저장해놨음
    private String apiKey;

    private static final String BASIC_SERVICE_ID = "Grid_20150827000000000226_1";//재료정보 서비스 이름
    private static final String COOKING_SERVICE_ID = "Grid_20150827000000000228_1";//과정정보 서비스 이름
    private static final String IRDNT_SERVICE_ID = "Grid_20150827000000000227_1";//재료정보 서비스 이름
    
    //난이도 태그 잘못넘어오는거 normalize 하는 메서드
    private String convertLevelNm(String apiLevel) {
        if (apiLevel == null) {
            return "중";
        }
        
        switch (apiLevel.trim()) {
            case "초보환영":
                return "하";
            case "보통":
                return "중";
            case "어려움":
                return "상";
            default:
                return "중";
        }
    }
    
    public void initBatch() {

        log.info(">>>> [시스템] 동기화 시작");

        // 1. 기본정보 넣기
        for (int i = 0; i <= 5; i++) {
            executeBatch(BASIC_SERVICE_ID, (i * 100) + 1, (i + 1) * 100);
        }

        // 2. 요리과정 넣기
        for (int i = 0; i <= 30; i++) {
            executeBatch(COOKING_SERVICE_ID, (i * 100) + 1, (i + 1) * 100);
        }

        // 3. 재료정보 넣기
        log.info(">>>> [시스템] 재료 정보 동기화 시작");
        for (int i = 0; i <= 61; i++) {
            executeBatch(IRDNT_SERVICE_ID, (i * 100) + 1, (i + 1) * 100);
        }

        log.info(">>>> [시스템] 모든 동기화 완료");
    }

    private void executeBatch(String serviceId, int start, int end) {
        String url = String.format("http://211.237.50.150:7080/openapi/%s/json/%s/%d/%d", 
                                    apiKey, serviceId, start, end);
        try {
            String response = restTemplate.getForObject(url, String.class);
            if (response != null && !response.isEmpty()) {
                if (BASIC_SERVICE_ID.equals(serviceId)) {
                    processRecipe(response);//기본정보 넣는 메서드
                } else if (COOKING_SERVICE_ID.equals(serviceId)) {
                    processCooking(response);//과정정보 넣는 메서드
                } else if (IRDNT_SERVICE_ID.equals(serviceId)) {
                    processIrdnt(response);//재료정보 넣는 메서드
                }
            }
        } catch (Exception e) {
            log.error(">>>> [에러] {} 서비스 {} 구간 수집 중 오류: {}", serviceId, start, e.getMessage());
        }
    }


    private void processRecipe(String jsonString) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rows = mapper.readTree(jsonString).path(BASIC_SERVICE_ID).path("row");
        if (rows.isMissingNode()) return;

        List<Recipe> list = new ArrayList<>(); //Recipe List 만들기
        
        for (JsonNode node : rows) {
            Recipe r = new Recipe(); //상위 클래스 생성후 pk 집어넣기
            r.setRecipeCode(node.path("RECIPE_ID").asText());

            //레시피 기본정보 생성후 필드 집어넣기
            Recipe_Info info = new Recipe_Info();
            info.setRecipeNmKo(node.path("RECIPE_NM_KO").asText());
            info.setSumry(node.path("SUMRY").asText());
            info.setNationCode(node.path("NATION_CODE").asText());
            info.setNationNm(node.path("NATION_NM").asText());
            info.setTyCode(node.path("TY_CODE").asText());
            info.setCookingTime(node.path("COOKING_TIME").asText());
            info.setCalorie(node.path("CALORIE").asText());
            info.setQnt(node.path("QNT").asText());
            String rawLevel = node.path("LEVEL_NM").asText(); 
            info.setLevelNm(convertLevelNm(rawLevel));

            r.setRecipeInfo(info); 
            
            
            list.add(r);
        }
        if (!list.isEmpty()) cookingMapper.insertRecipeList(list);
    }


    private void processCooking(String jsonString) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rows = mapper.readTree(jsonString).path(COOKING_SERVICE_ID).path("row");
        if (rows.isMissingNode()) return;

        List<Cooking_Info> list = new ArrayList<>();
        for (JsonNode node : rows) {
            Cooking_Info c = new Cooking_Info();
            c.setRecipeId(node.path("RECIPE_ID").asText());
            c.setCookingNo(node.path("COOKING_NO").asInt());
            c.setCookingDc(node.path("COOKING_DC").asText());
            c.setStepTip(node.path("STEP_TIP").asText());
            c.setStepImgUrl(node.path("STEP_IMG_URL").asText());
            list.add(c);
        }
        if (!list.isEmpty()) {
        	cookingMapper.insertCookingInfoList(list);
        	log.info(">>>> [성공] 과정 정보 {}건 DB 입력 완료", list.size());}
    }

    private void processIrdnt(String jsonString) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode rows = mapper.readTree(jsonString).path(IRDNT_SERVICE_ID).path("row");
        if (rows.isMissingNode()) return;

        List<Irdnt_Info> list = new ArrayList<>();
        for (JsonNode node : rows) {
            Irdnt_Info i = new Irdnt_Info();
            i.setRecipeId(node.path("RECIPE_ID").asText());
            i.setIrdntSn(node.path("IRDNT_SN").asInt());
            i.setIrdntNm(node.path("IRDNT_NM").asText());
            i.setIrdntCpcty(node.path("IRDNT_CPCTY").asText());
            i.setIrdntTyCode(node.path("IRDNT_TY_CODE").asText());
            i.setIrdntTyNm(node.path("IRDNT_TY_NM").asText());
            
            list.add(i);
        }
        if (!list.isEmpty()) {
            cookingMapper.insertIrdntList(list);
            log.info(">>>> [성공] 재료 정보 {}건 DB 입력 완료", list.size());
        }
    }
}