package org.cloud.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Recipe_Info {
    private String recipeId;      // RECIPE_ID (varchar)
    private String recipeNmKo;
    private String sumry;
    private String nationCode;
    private String nationNm;
    private String tyCode;
    private String tyNm;
    private String cookingTime;
    private String calorie;
    private String qnt;
    private String levelNm;
    private String irdntCode;     // 앱 내부용 (DB 컬럼 없음)
    private String pcNm;          // 앱 내부용 (DB의 PRICE는 Recipe.price로 처리)
    private int hit;
    private int likeCount;        // DB: LIKE_COUNT
    private int price;            // DB: PRICE
    private String thumbImgUrl;       // 조회 시 서브쿼리로 채워짐
    private String writerId;          // 작성자 ID
    private String writerNickname;    // 작성자 닉네임 (MEMBER JOIN)
    private String writerProfileImg;  // 작성자 프로필 이미지 (MEMBER JOIN)
    private String videoUrl;
    private String createdAt;
    private List<Tag> tags = new ArrayList<>();
}
