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

    // 수정 (전체 필드 + 가격)
    int updateFullRecipe(Recipe recipe);

    // 재료/조리과정 전체 삭제 (수정 시 delete-insert 방식)
    int deleteIrdntInfo(@Param("recipeId") String recipeId);
    int deleteCookingInfo(@Param("recipeId") String recipeId);

    // 작성자 ID로 레시피 목록 조회
    List<Recipe_Info> selectRecipesByWriterId(@Param("writerId") String writerId);

    // 단건 조회
    Recipe_Info selectRecipeInfoById(@Param("recipeId") String recipeId);
    List<Cooking_Info> selectCookingInfoByRecipeId(@Param("recipeId") String recipeId);
    List<Irdnt_Info> selectIrdntInfoByRecipeId(@Param("recipeId") String recipeId);

    // 삭제
    int deleteRecipe(String recipeId);

    int countRecipeById(String writerId);

    int incrementHit(@Param("recipeId") String recipeId);
}
