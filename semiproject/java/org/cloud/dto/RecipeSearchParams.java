package org.cloud.dto;

import java.util.List;

public class RecipeSearchParams {

    private String recipeNmKo;      // 이름 검색
    private List<Integer> tagIds;     // 태그 필터 (복수, OR 조건)
    private String levelNm;          // 난이도 필터 (상/중/하)
    private List<String> irdntNms;   // 재료 필터 (복수)
    private int page = 1;           // 페이지 번호 (1부터 시작)
    private int size = 12;          // 페이지당 개수
    private String sortType = "all"; // 드롭다운
    private String cookingTimeFilter = "all";    //조리시간

    public String getRecipeNmKo() { return recipeNmKo; }
    public void setRecipeNmKo(String recipeNmKo) { this.recipeNmKo = recipeNmKo; }

    public List<Integer> getTagIds() { return tagIds; }
    public void setTagIds(List<Integer> tagIds) { this.tagIds = tagIds; }

    public String getLevelNm() { return levelNm; }
    public void setLevelNm(String levelNm) { this.levelNm = levelNm; }

    public List<String> getIrdntNms() { return irdntNms; }
    public void setIrdntNms(List<String> irdntNms) { this.irdntNms = irdntNms; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }
    
    public String getSortType() { return sortType; }
    public void setSortType(String sortType) { this.sortType = sortType; }
    
    public String getCookingTimeFilter() { return cookingTimeFilter; }
    public void setCookingTimeFilter(String cookingTimeFilter) { this.cookingTimeFilter = cookingTimeFilter; }

    // MyBatis에서 OFFSET 계산용
    public int getOffset() { return (page - 1) * size; }
}
