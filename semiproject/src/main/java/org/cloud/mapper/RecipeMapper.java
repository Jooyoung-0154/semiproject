package org.cloud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.cloud.dto.*;
import java.util.List;

@Mapper
public interface RecipeMapper {

    // 조회 (기존 간단 검색)
    List<Recipe_Info> selectRecipeList(@Param("recipeNmKo") String recipeNmKo, @Param("tagId") Integer tagId);

    // 페이징 + 필터 검색
    List<Recipe_Info> selectRecipeListPaged(RecipeSearchParams params);
    int countRecipeList(RecipeSearchParams params);

    // 등록: RECIPE 테이블에 모든 필드를 한 번에 INSERT
    int insertFullRecipe(Recipe recipe);

    // 재료 등록
    int insertIrdntInfo(List<Irdnt_Info> irdntList);

    // 조리 과정 등록
    int insertCookingInfo(List<Cooking_Info> cookingList);

    // 수정
    int updateRecipeInfo(Recipe_Info info);

    // 작성자 ID로 레시피 목록 조회
    List<Recipe_Info> selectRecipesByWriterId(@Param("writerId") String writerId);

    // 삭제
    int deleteRecipe(String recipeId);
}
