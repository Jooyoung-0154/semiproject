package org.cloud.dto;

import java.util.List;
import java.util.ArrayList;

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
    private int    hit;
    private int    likeCount;     // DB: LIKE_COUNT
    private int    price;         // DB: PRICE
    private String thumbImgUrl;       // 조회 시 서브쿼리로 채워짐
    private String writerId;          // 작성자 ID
    private String writerNickname;    // 작성자 닉네임 (MEMBER JOIN)
    private String writerProfileImg;  // 작성자 프로필 이미지 (MEMBER JOIN)
    private String videoUrl;
    private String createdAt;
    private List<Tag> tags = new ArrayList<>();  // 태그 목록

    public String getRecipeId() { return recipeId; }
    public void setRecipeId(String recipeId) { this.recipeId = recipeId; }

    public String getRecipeNmKo() { return recipeNmKo; }
    public void setRecipeNmKo(String recipeNmKo) { this.recipeNmKo = recipeNmKo; }

    public String getSumry() { return sumry; }
    public void setSumry(String sumry) { this.sumry = sumry; }

    public String getNationCode() { return nationCode; }
    public void setNationCode(String nationCode) { this.nationCode = nationCode; }

    public String getNationNm() { return nationNm; }
    public void setNationNm(String nationNm) { this.nationNm = nationNm; }

    public String getTyCode() { return tyCode; }
    public void setTyCode(String tyCode) { this.tyCode = tyCode; }

    public String getTyNm() { return tyNm; }
    public void setTyNm(String tyNm) { this.tyNm = tyNm; }

    public String getCookingTime() { return cookingTime; }
    public void setCookingTime(String cookingTime) { this.cookingTime = cookingTime; }

    public String getCalorie() { return calorie; }
    public void setCalorie(String calorie) { this.calorie = calorie; }

    public String getQnt() { return qnt; }
    public void setQnt(String qnt) { this.qnt = qnt; }

    public String getLevelNm() { return levelNm; }
    public void setLevelNm(String levelNm) { this.levelNm = levelNm; }

    public String getIrdntCode() { return irdntCode; }
    public void setIrdntCode(String irdntCode) { this.irdntCode = irdntCode; }

    public String getPcNm() { return pcNm; }
    public void setPcNm(String pcNm) { this.pcNm = pcNm; }

    public int getHit() { return hit; }
    public void setHit(int hit) { this.hit = hit; }

    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }

    public int getPrice() { return price; }
    public void setPrice(int price) { this.price = price; }

    public String getThumbImgUrl() { return thumbImgUrl; }
    public void setThumbImgUrl(String thumbImgUrl) { this.thumbImgUrl = thumbImgUrl; }

    public String getWriterId() { return writerId; }
    public void setWriterId(String writerId) { this.writerId = writerId; }

    public String getWriterNickname() { return writerNickname; }
    public void setWriterNickname(String writerNickname) { this.writerNickname = writerNickname; }

    public String getWriterProfileImg() { return writerProfileImg; }
    public void setWriterProfileImg(String writerProfileImg) { this.writerProfileImg = writerProfileImg; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<Tag> getTags() { return tags; }
    public void setTags(List<Tag> tags) { this.tags = tags; }
}
