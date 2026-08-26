package org.cloud.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecipeSearchParams {
    private String recipeNmKo;              // 이름 검색
    private List<Integer> tagIds;            // 태그 필터 (복수, OR 조건)
    private String levelNm;                  // 난이도 필터 (상/중/하)
    private List<String> irdntNms;           // 재료 필터 (복수)
    private int page = 1;                    // 페이지 번호 (1부터 시작)
    private int size = 12;                   // 페이지당 개수
    private String sortType = "all";         // 드롭다운
    private String cookingTimeFilter = "all"; // 조리시간

    // MyBatis에서 OFFSET 계산용
    public int getOffset() {
        return (page - 1) * size;
    }
}
